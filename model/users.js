var mongoose = require("mongoose");
const crypto = require("crypto");

var userSchema = mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    chatId: String,
    midAddress: String,
    privateKey: String,
    stakeIndex: {
      type: String,
      default: "1",
    },
  },
  {
    timeStamps: true,
  }
);

function encryption(text) {
  let cipher = crypto.createCipheriv(
    process.env.algorithm,
    Buffer.from(process.env.key, "hex"),
    Buffer.from(process.env.iv, "hex")
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted.toString("hex");
}

function decryption(text) {
  let encryptedText = Buffer.from(text, "hex");

  let decipher = crypto.createDecipheriv(
    process.env.algorithm,
    Buffer.from(process.env.key, "hex"),
    Buffer.from(process.env.iv, "hex")
  );

  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}

userSchema.methods.encrypt = async function () {
  let encryptData1 = encryption(this.privateKey);
  this.privateKey = encryptData1;
};

module.exports.User = mongoose.model("User", userSchema);
module.exports.decryption = decryption;
