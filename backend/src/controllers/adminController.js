const User = require("../models/User");
const Availability = require("../models/Availability");
const Appointment = require("../models/Appointment");
const Break = require("../models/Break");
const { toMinutes, overlaps, getPeriodSlots, excludeBreaks } = require("../services/slotService");

const createDoctor = async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "name, email and password are required" });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const doctor = await User.create({ name, email, password, phone, role: "doctor" });

  res.status(201).json({ doctor });
};

const listDoctors = async (req, res) => {
  const doctors = await User.find({ role: "doctor" });
  res.json({ doctors });
};

const getDoctor = async (req, res) => {
  const doctor = await User.findOne({ _id: req.params.id, role: "doctor" });

  if (!doctor) {
    return res.status(404).json({ message: "Doctor not found" });
  }

  res.json({ doctor });
};

const updateDoctor = async (req, res) => {
  const { name, phone, isActive } = req.body;

  const doctor = await User.findOneAndUpdate(
    { _id: req.params.id, role: "doctor" },
    { $set: { name, phone, isActive } },
    { new: true, omitUndefined: true }
  );

  if (!doctor) {
    return res.status(404).json({ message: "Doctor not found" });
  }

  res.json({ doctor });
};

const createAvailability = async (req, res) => {
  const { doctorId, date, startTime, endTime } = req.body;

  if (!doctorId || !date || !startTime || !endTime) {
    return res.status(400).json({ message: "doctorId, date, startTime and endTime are required" });
  }

  const doctor = await User.findOne({ _id: doctorId, role: "doctor" });
  if (!doctor) {
    return res.status(404).json({ message: "Doctor not found" });
  }

  const siblings = await Availability.find({ doctorId, date });
  const conflict = siblings.some((sibling) =>
    overlaps(toMinutes(startTime), toMinutes(endTime), toMinutes(sibling.startTime), toMinutes(sibling.endTime))
  );
  if (conflict) {
    return res.status(409).json({ message: "Requested period overlaps an existing availability period for this doctor/date" });
  }

  try {
    const availability = await Availability.create({ doctorId, date, startTime, endTime });
    res.status(201).json({ availability });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "An identical availability period already exists" });
    }
    res.status(400).json({ message: error.message });
  }
};

const updateAvailability = async (req, res) => {
  const { startTime, endTime } = req.body;

  const availability = await Availability.findById(req.params.id);
  if (!availability) {
    return res.status(404).json({ message: "Availability not found" });
  }

  const nextStartTime = startTime || availability.startTime;
  const nextEndTime = endTime || availability.endTime;

  const siblings = await Availability.find({
    doctorId: availability.doctorId,
    date: availability.date,
    _id: { $ne: availability._id },
  });
  const conflict = siblings.some((sibling) =>
    overlaps(toMinutes(nextStartTime), toMinutes(nextEndTime), toMinutes(sibling.startTime), toMinutes(sibling.endTime))
  );
  if (conflict) {
    return res.status(409).json({ message: "Requested period overlaps an existing availability period for this doctor/date" });
  }

  availability.startTime = nextStartTime;
  availability.endTime = nextEndTime;

  try {
    await availability.save();
    res.json({ availability });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const listAvailability = async (req, res) => {
  const { doctorId, date } = req.query;
  const filter = {};
  if (doctorId) filter.doctorId = doctorId;
  if (date) filter.date = date;

  const availability = await Availability.find(filter);
  res.json({ availability });
};

const createBreak = async (req, res) => {
  const { doctorId, date, startTime, endTime } = req.body;

  if (!doctorId || !date || !startTime || !endTime) {
    return res.status(400).json({ message: "doctorId, date, startTime and endTime are required" });
  }

  const doctor = await User.findOne({ _id: doctorId, role: "doctor" });
  if (!doctor) {
    return res.status(404).json({ message: "Doctor not found" });
  }

  const candidateBreak = new Break({ doctorId, date, startTime, endTime });
  const validationError = candidateBreak.validateSync();
  if (validationError) {
    return res.status(400).json({ message: validationError.message });
  }

  const bookedAppointments = await Appointment.find({ doctorId, date, status: "booked" }).populate(
    "patientId",
    "name"
  );

  const breakStart = toMinutes(startTime);
  const breakEnd = toMinutes(endTime);

  const affected = bookedAppointments
    .filter((appt) => overlaps(toMinutes(appt.startTime), toMinutes(appt.endTime), breakStart, breakEnd))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const unaffectedIds = new Set(
    bookedAppointments.filter((appt) => !affected.includes(appt)).map((appt) => String(appt._id))
  );

  let pool = [];
  if (affected.length > 0) {
    const periodSlots = await getPeriodSlots(doctorId, date);
    const existingBreaks = await Break.find({ doctorId, date });
    const afterBreak = excludeBreaks(periodSlots, [...existingBreaks, { startTime, endTime }]);
    pool = afterBreak.filter((slot) => {
      const takenByOther = bookedAppointments.some(
        (appt) => unaffectedIds.has(String(appt._id)) && appt.startTime === slot.startTime
      );
      return !takenByOther;
    });
  }

  const assignments = [];
  for (const appt of affected) {
    const apptStart = toMinutes(appt.startTime);
    let best = null;
    let bestDistance = Infinity;

    for (const slot of pool) {
      const distance = Math.abs(toMinutes(slot.startTime) - apptStart);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = slot;
      }
    }

    if (!best) {
      return res.status(409).json({
        message: `Cannot add break: no available slot to move the ${appt.startTime} appointment (patient ${appt.patientId?.name || "unknown"}). Break was not created.`,
      });
    }

    pool = pool.filter((slot) => slot.startTime !== best.startTime);
    assignments.push({ appointment: appt, from: appt.startTime, to: best });
  }

  let createdBreak;
  try {
    createdBreak = await Break.create({ doctorId, date, startTime, endTime });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  const movedAppointments = [];
  for (const assignment of assignments) {
    try {
      assignment.appointment.startTime = assignment.to.startTime;
      assignment.appointment.endTime = assignment.to.endTime;
      await assignment.appointment.save();
      movedAppointments.push({
        appointmentId: assignment.appointment._id,
        patientId: assignment.appointment.patientId?._id || assignment.appointment.patientId,
        from: assignment.from,
        to: assignment.to.startTime,
      });
    } catch (error) {
      return res.status(500).json({
        message: `Break was created but relocating appointment ${assignment.appointment._id} failed: ${error.message}. Please review manually.`,
      });
    }
  }

  res.status(201).json({ break: createdBreak, movedAppointments });
};

const listBreaks = async (req, res) => {
  const { doctorId, date } = req.query;
  const filter = {};
  if (doctorId) filter.doctorId = doctorId;
  if (date) filter.date = date;

  const breaks = await Break.find(filter);
  res.json({ breaks });
};

const listPatients = async (req, res) => {
  const patients = await User.find({ role: "patient" });
  res.json({ patients });
};

const listAppointments = async (req, res) => {
  const { doctorId, patientId, date, status } = req.query;
  const filter = {};
  if (doctorId) filter.doctorId = doctorId;
  if (patientId) filter.patientId = patientId;
  if (date) filter.date = date;
  if (status) filter.status = status;

  const appointments = await Appointment.find(filter)
    .populate("doctorId", "name email")
    .populate("patientId", "name email");

  res.json({ appointments });
};

module.exports = {
  createDoctor,
  listDoctors,
  getDoctor,
  updateDoctor,
  createAvailability,
  updateAvailability,
  listAvailability,
  createBreak,
  listBreaks,
  listPatients,
  listAppointments,
};
