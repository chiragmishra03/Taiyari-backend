const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const AuthRoute = require("./routes/AuthRoute");
const app = express();
const PORT = process.env.PORT || 4000;
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
app.use(
  cors({
    origin: "https://taiyarikarlo.netlify.app/",
    credentials: true,
  })
);
app.use(express.json());
const connectToDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected");
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1);
  }
};
mongoose.connection.on("disconnected", connectToDb);
app.use("/api/auth", AuthRoute);

app.post("/api/questions/create-ques", async (req, res) => {
  try {
    const { language, level } = req.body;
    const prompt = `Write 5 Interview Questions of ${level} difficulty on the topic ${language} for a developer role,dont add any other info other than questions , just questions`;
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const questionsArray = responseText
      .split("\n")
      .filter((line) => line.trim().match(/^\d+\.\s+/))
      .map((line) => line.replace(/^\d+\.\s*/, "").trim());
    return res.status(201).json({ questions: questionsArray });
  } catch (err) {
    console.error("Error generating questions:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to generate questions",
    });
  }
});

app.post("/api/questions/get-feedback", async (req, res) => {
  try {
    const { answerArray, questionArray } = req.body;

    // Format the questions and answers into a string for the prompt
    const formattedQuestions = questionArray
      .map((q) => `Q${q.id}: ${q.question}`)
      .join("\n");
    const formattedAnswers = answerArray
      .map((a) => `A${a.id}: ${a.answer}`)
      .join("\n");

    const prompt = `Evaluate the following answers based on the provided questions as interview process, so provide a in one paragraph and atlast add a overall rating. Be strict and evaluate carefully.\n\nQuestions:\n${formattedQuestions}\n\nAnswers:\n${formattedAnswers}`;
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return res.status(201).json({ feedback: responseText });
  } catch (err) {
    console.error("Error generating feedback:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to generate feedback",
    });
  }
});
const startServer = async () => {
  try {
    await connectToDb();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};
startServer();
