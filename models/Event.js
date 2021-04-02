var mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventSchema = new Schema({
  title: { type: String, required: true },
  daysOfWeek: { type: [String], required: true },
  timeStart: String,
  timeEnd: String,
  dateStart: { type: Date, required: true },
  dateEnd: { type: Date, required: true },
  label: Number,
  description: String,
});

module.exports = mongoose.model("event", eventSchema);
