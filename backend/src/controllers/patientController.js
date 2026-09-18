const User = require("../models/User");
const Appointment = require("../models/Appointment");
const { getAvailableSlots } = require("../services/slotService");

const listDoctors = async (req, res) => {
  const doctors = await User.find({ role: "doctor", isActive: true }).select("name email phone");
  res.json({ doctors });
};

const listSlots = async (req, res) => {
  const { doctorId } = req.params;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ message: "date query param is required" });
  }

  const doctor = await User.findOne({ _id: doctorId, role: "doctor", isActive: true });
  if (!doctor) {
    return res.status(404).json({ message: "Doctor not found" });
  }

  const slots = await getAvailableSlots(doctorId, date);
  res.json({ slots });
};

const bookAppointment = async (req, res) => {
  const { doctorId, date, startTime } = req.body;

  if (!doctorId || !date || !startTime) {
    return res.status(400).json({ message: "doctorId, date and startTime are required" });
  }

  const doctor = await User.findOne({ _id: doctorId, role: "doctor", isActive: true });
  if (!doctor) {
    return res.status(404).json({ message: "Doctor not found" });
  }

  const slots = await getAvailableSlots(doctorId, date);
  const slot = slots.find((s) => s.startTime === startTime);

  if (!slot) {
    return res.status(400).json({ message: "Requested slot is not available" });
  }

  try {
    const appointment = await Appointment.create({
      doctorId,
      patientId: req.user.id,
      date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: "booked",
    });

    res.status(201).json({ appointment });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Slot no longer available" });
    }
    res.status(400).json({ message: error.message });
  }
};

const listAppointments = async (req, res) => {
  const { status } = req.query;
  const filter = { patientId: req.user.id };
  if (status) filter.status = status;

  const appointments = await Appointment.find(filter).populate("doctorId", "name email");
  res.json({ appointments });
};

const cancelAppointment = async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return res.status(404).json({ message: "Appointment not found" });
  }

  if (!appointment.patientId.equals(req.user.id)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (appointment.status === "cancelled") {
    return res.status(400).json({ message: "Appointment already cancelled" });
  }

  appointment.status = "cancelled";
  await appointment.save();

  res.json({ appointment });
};

module.exports = { listDoctors, listSlots, bookAppointment, listAppointments, cancelAppointment };
