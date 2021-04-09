var mongoose = require("mongoose");
const Schema = mongoose.Schema;

const labelSchema = new Schema({
  title: { type: String, required: true },
  color: { type: String, required: true },
  userId: { type: String, required: true },
});

module.exports = mongoose.model("label", labelSchema);
