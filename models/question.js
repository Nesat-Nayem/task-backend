// models/question.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: String,
  questionType: String,
  chartType: String,
  questionIndex: Number,
  survey: String,
  questionText: [String],
  isLibraryQuestion: Boolean,
  isHidden: Boolean,
  excludedCharts: [String],
  comments: [String],
  createdAt: Date,
  updatedAt: Date,
  analysis: String,
  imgList: [String],
  otherOptions: [String],
});

module.exports = mongoose.model('Question', questionSchema);
