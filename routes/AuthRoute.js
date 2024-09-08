const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/UserModel.js");
const jwt = require("jsonwebtoken");
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) return res.status(401).json({ error: "no user found" });
  else {
    const UserPass = user.password;
    const CorrectedPass = await bcrypt.compare(password, UserPass);
    if (CorrectedPass) {
      const userObject = user.toObject();
      const { password, ...userWithoutPassword } = userObject;
      return res.json({
        message: "login successful",
        userfield: userWithoutPassword,
      });
    } else {
      return res.status(401).json({ error: "Invalid Credentials" });
    }
  }
});
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    const hashedPass = await bcrypt.hash(password, 10);
    const newUser = new User({ ...req.body, password: hashedPass });
    const savedUser = await newUser.save();
    return res.status(201).json({ message: "successful" });
  } else {
    return res.status(409).json({ error: "user already present" });
  }
});

router.post("/add-quiz", async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "ID is required" });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.quizes = (user.quizes || 0) + 1;
    const updatedUser = await user.save();
    const userObject = updatedUser.toObject();
    const { password, ...userWithoutPassword } = userObject;
    return res.status(200).json({
      message: "quiz added succesfully",
      userfield: userWithoutPassword,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
