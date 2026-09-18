require("dotenv").config();

const connectDB = require("../config/db");
const User = require("../models/User");
const Availability = require("../models/Availability");
const Appointment = require("../models/Appointment");
const Break = require("../models/Break");

const dateStr = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

const doctorsData = [
  { name: "Dr. Sarah Chen", email: "sarah.chen@clinic.com", password: "doctor123", phone: "555-0101" },
  { name: "Dr. James Patel", email: "james.patel@clinic.com", password: "doctor123", phone: "555-0102" },
  { name: "Dr. Maria Gonzalez", email: "maria.gonzalez@clinic.com", password: "doctor123", phone: "555-0103" },
  { name: "Dr. Tom Nguyen", email: "tom.nguyen@clinic.com", password: "doctor123", phone: "555-0104", isActive: false },
];

const patientsData = [
  { name: "Alice Johnson", email: "alice.johnson@gmail.com", password: "patient123", phone: "555-0201", dob: new Date("1990-04-12"), gender: "female" },
  { name: "Brian Lee", email: "brian.lee@gmail.com", password: "patient123" },
  { name: "Carla Mendes", email: "carla.mendes@gmail.com", password: "patient123", phone: "555-0203" },
  { name: "David Kim", email: "david.kim@gmail.com", password: "patient123" },
  { name: "Emma Davis", email: "emma.davis@gmail.com", password: "patient123", phone: "555-0205", dob: new Date("1985-11-02"), gender: "female" },
];

const run = async () => {
  await connectDB();

  await User.deleteMany({ role: { $in: ["doctor", "patient"] } });
  await Availability.deleteMany({});
  await Appointment.deleteMany({});
  await Break.deleteMany({});

  const doctors = await User.insertMany(
    doctorsData.map((d) => ({ ...d, role: "doctor" }))
  );
  const patients = await User.insertMany(
    patientsData.map((p) => ({ ...p, role: "patient" }))
  );

  const [chen, patel, gonzalez, nguyen] = doctors;
  const [alice, brian, carla, david, emma] = patients;

  const availabilityRows = [];
  for (let offset = 0; offset <= 4; offset++) {
    // Chen: split hours with a lunch gap - 09-13 and 14-17
    availabilityRows.push({ doctorId: chen._id, date: dateStr(offset), startTime: "09:00", endTime: "13:00" });
    availabilityRows.push({ doctorId: chen._id, date: dateStr(offset), startTime: "14:00", endTime: "17:00" });

    // Patel: single continuous day, for contrast
    availabilityRows.push({ doctorId: patel._id, date: dateStr(offset), startTime: "09:00", endTime: "17:00" });

    // Gonzalez: shorter split day - 10-13 and 14-16
    availabilityRows.push({ doctorId: gonzalez._id, date: dateStr(offset), startTime: "10:00", endTime: "13:00" });
    availabilityRows.push({ doctorId: gonzalez._id, date: dateStr(offset), startTime: "14:00", endTime: "16:00" });
  }
  // Nguyen is inactive but still has a stray availability record from before deactivation
  availabilityRows.push({ doctorId: nguyen._id, date: dateStr(1), startTime: "10:00", endTime: "15:00" });

  await Availability.insertMany(availabilityRows);

  const appointmentRows = [
    { doctorId: chen._id, patientId: alice._id, date: dateStr(0), startTime: "09:00", endTime: "10:00", status: "booked" },
    { doctorId: chen._id, patientId: brian._id, date: dateStr(0), startTime: "11:00", endTime: "12:00", status: "booked" },
    { doctorId: chen._id, patientId: carla._id, date: dateStr(1), startTime: "14:00", endTime: "15:00", status: "booked" },
    { doctorId: patel._id, patientId: david._id, date: dateStr(0), startTime: "10:00", endTime: "11:00", status: "booked" },
    { doctorId: patel._id, patientId: emma._id, date: dateStr(2), startTime: "09:00", endTime: "10:00", status: "booked" },
    { doctorId: gonzalez._id, patientId: alice._id, date: dateStr(3), startTime: "12:00", endTime: "13:00", status: "booked" },

    // cancelled history - slot is free again for others
    { doctorId: chen._id, patientId: david._id, date: dateStr(0), startTime: "16:00", endTime: "17:00", status: "cancelled" },
    { doctorId: patel._id, patientId: carla._id, date: dateStr(1), startTime: "16:00", endTime: "17:00", status: "cancelled" },
    { doctorId: gonzalez._id, patientId: brian._id, date: dateStr(2), startTime: "11:00", endTime: "12:00", status: "cancelled" },
    // same slot rebooked by someone else after the cancellation above
    { doctorId: gonzalez._id, patientId: emma._id, date: dateStr(2), startTime: "11:00", endTime: "12:00", status: "booked" },
  ];

  await Appointment.insertMany(appointmentRows);

  const breakRows = [
    // Chen: short break inside the free 12:00-13:00 slot on day 0 (09:00 and 11:00 are already booked, untouched)
    { doctorId: chen._id, date: dateStr(0), startTime: "12:15", endTime: "12:45" },
    // Gonzalez: break inside the free 10:00-11:00 slot on day 3 (alice's 12:00 booking is unaffected)
    { doctorId: gonzalez._id, date: dateStr(3), startTime: "10:30", endTime: "11:00" },
    // Patel: a break on a day with no bookings at all
    { doctorId: patel._id, date: dateStr(4), startTime: "12:30", endTime: "13:30" },
  ];

  await Break.insertMany(breakRows);

  console.log(`Seeded ${doctors.length} doctors, ${patients.length} patients, ${availabilityRows.length} availability rows, ${appointmentRows.length} appointments, ${breakRows.length} breaks`);
  process.exit(0);
};

run().catch((error) => {
  console.error("Demo seed failed:", error.message);
  process.exit(1);
});
