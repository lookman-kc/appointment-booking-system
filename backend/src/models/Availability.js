const mongoose = require("mongoose");

const TIME_REGEX = /^([01]\d|2[0-3]):00$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const availabilitySchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String,
      required: true,
      match: DATE_REGEX,
    },
    startTime: {
      type: String,
      required: true,
      match: TIME_REGEX,
    },
    endTime: {
      type: String,
      required: true,
      match: TIME_REGEX,
      validate: {
        validator: function (value) {
          return value > this.startTime;
        },
        message: "endTime must be after startTime",
      },
    },
  },
  {
    timestamps: true,
  }
);

availabilitySchema.index({ doctorId: 1, date: 1, startTime: 1 }, { unique: true });

module.exports = mongoose.model("Availability", availabilitySchema);
