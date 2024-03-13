// models/answer.js
const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  submissionId: Number,
  questionIndex: Number,
  answer: String,
  other: Boolean,
  otherField: String,
  survey: String,
});

module.exports = mongoose.model('Answer', answerSchema);
