const mongoose = require("mongoose");

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const breakSchema = new mongoose.Schema(
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

breakSchema.index({ doctorId: 1, date: 1 });

module.exports = mongoose.model("Break", breakSchema);
