var mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventSchema = new Schema({
  title: { type: String, required: true },
  daysOfWeek: { type: [Number], required: true },
  timeStart: String,
  timeEnd: String,
  dateStart: { type: Date, required: true },
  dateEnd: { type: Date, required: true },
  label: String,
  description: String,
  userId: { type: String, required: true },
  checked: [{ day: Number, month: Number, year: Number }],
});

module.exports = mongoose.model("event", eventSchema);
