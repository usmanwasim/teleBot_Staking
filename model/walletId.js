var mongoose = require("mongoose");

var idSchema = mongoose.Schema({
  title: {
    type: String,
    default: "midId",
  },
  midId: {
    type: Number,
    default: 0,
  },
});

module.exports.WalletPrivateId = mongoose.model("WalletPrivateId", idSchema);
