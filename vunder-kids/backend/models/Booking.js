const mongoose = require("mongoose");

const questionAnswerSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Refer to the User model
      required: true,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

const QuestionAnswer = mongoose.model("QuestionAnswer", questionAnswerSchema);

module.exports = QuestionAnswer;
