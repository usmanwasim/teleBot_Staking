var mongoose = require("mongoose");

var planSchema = mongoose.Schema({
  Index: String,
  MinAmount: String,
  MaxAmount: String,
  Duration: String,
});

module.exports.PlansRecord = mongoose.model("PlansRecord", planSchema);
