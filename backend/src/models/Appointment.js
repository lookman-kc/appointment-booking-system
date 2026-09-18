const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["booked", "cancelled"],
      default: "booked",
    },
  },
  {
    timestamps: true,
  }
);

appointmentSchema.index(
  { doctorId: 1, date: 1, startTime: 1 },
  { unique: true, partialFilterExpression: { status: "booked" } }
);
appointmentSchema.index({ patientId: 1 });
appointmentSchema.index({ doctorId: 1, date: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);
