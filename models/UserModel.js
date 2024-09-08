const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    quizes: { type: Number, default: 0 },
  },
  { timeStamps: true }
);
const User = mongoose.model("User", userSchema);
module.exports = User;
