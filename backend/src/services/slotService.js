const Availability = require("../models/Availability");
const Break = require("../models/Break");
const Appointment = require("../models/Appointment");

const toMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const toTime = (minutes) => {
  const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
  return `${hours}:00`;
};

const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && aEnd > bStart;

const getPeriodSlots = async (doctorId, date) => {
  const periods = await Availability.find({ doctorId, date });
  if (periods.length === 0) return [];

  const slotMap = new Map();
  periods.forEach((period) => {
    const start = toMinutes(period.startTime);
    const end = toMinutes(period.endTime);
    for (let slotStart = start; slotStart + 60 <= end; slotStart += 60) {
      const startTime = toTime(slotStart);
      slotMap.set(startTime, { startTime, endTime: toTime(slotStart + 60) });
    }
  });

  return Array.from(slotMap.values()).sort((a, b) => a.startTime.localeCompare(b.startTime));
};

const excludeBreaks = (slots, breaks) => {
  return slots.filter((slot) => {
    const slotStart = toMinutes(slot.startTime);
    const slotEnd = toMinutes(slot.endTime);
    return !breaks.some((brk) =>
      overlaps(slotStart, slotEnd, toMinutes(brk.startTime), toMinutes(brk.endTime))
    );
  });
};

const getAvailableSlots = async (doctorId, date) => {
  const slots = await getPeriodSlots(doctorId, date);
  if (slots.length === 0) return [];

  const breaks = await Break.find({ doctorId, date });
  const afterBreaks = excludeBreaks(slots, breaks);

  const booked = await Appointment.find({ doctorId, date, status: "booked" }).select("startTime");
  const bookedTimes = new Set(booked.map((appointment) => appointment.startTime));

  return afterBreaks.filter((slot) => !bookedTimes.has(slot.startTime));
};

module.exports = { toMinutes, toTime, overlaps, getPeriodSlots, excludeBreaks, getAvailableSlots };
