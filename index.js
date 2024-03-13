// app.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Question = require("./models/question");
const Answer = require("./models/answer");

const app = express();
app.use(cors());

// Connect to MongoDB
mongoose.connect(
  `mongodb+srv://standardinsights:N9AJFczqi1AiwjhW@cluster0.hty68.mongodb.net/standardinsights`
);

// API endpoint to fetch aggregated data
app.get("/api/data", async (req, res) => {
  try {
    // Fetch questions from the database
    const questions = await Question.find();

    // Fetch answers from the database
    const answers = await Answer.find();

    const ageGenderData = await Answer.aggregate([
      {
        // Match only answers that have questionIndex 0 or 1 (age or gender)
        $match: { questionIndex: { $in: [0, 1] } },
      },
      {
        // Sort the documents to ensure that age answers are processed first
        $sort: { questionIndex: 1 },
      },
      {
        // Group by submissionId to get age and gender in the same document
        $group: {
          _id: "$submissionId",
          answers: {
            $push: { questionIndex: "$questionIndex", answer: "$answer" },
          },
        },
      },
      {
        // Filter out documents that don't have both age and gender answers
        $match: { "answers.1": { $exists: true } },
      },
      {
        // Project to transform the answers array into separate fields
        $project: {
          age: { $arrayElemAt: ["$answers", 0] },
          gender: { $arrayElemAt: ["$answers", 1] },
        },
      },
      {
        // Ensure that age is in the correct field and gender is in the correct field
        $project: {
          age: {
            $cond: {
              if: { $eq: ["$age.questionIndex", 0] },
              then: "$age.answer",
              else: "$gender.answer",
            },
          },
          gender: {
            $cond: {
              if: { $eq: ["$gender.questionIndex", 1] },
              then: "$gender.answer",
              else: "$age.answer",
            },
          },
        },
      },
      {
        // Group by age and gender to count each combination
        $group: {
          _id: { age: "$age", gender: "$gender" },
          count: { $sum: 1 },
        },
      },
      {
        // Group by age to get the total count and separate male/female counts
        $group: {
          _id: "$_id.age",
          male: {
            $sum: { $cond: [{ $eq: ["$_id.gender", "Male"] }, "$count", 0] },
          },
          female: {
            $sum: { $cond: [{ $eq: ["$_id.gender", "Female"] }, "$count", 0] },
          },
          total: { $sum: "$count" },
        },
      },
      {
        // Sort by age
        $sort: { _id: 1 },
      },
    ]);

    // Aggregate data for location
    const locationData = await Answer.aggregate([
      { $match: { questionIndex: 2 } },
      {
        $group: {
          _id: "$answer",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Aggregate data for answers
    const answersData = await Answer.aggregate([
      { $match: { questionIndex: 3 } },
      {
        $group: {
          _id: "$answer",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Prepare the response data
    const data = {
      questions,
      ageGenderData,
      locationData,
      answersData,
    };

    res.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
app.listen(7070, () => {
  console.log("Server is running on port 7070");
});
