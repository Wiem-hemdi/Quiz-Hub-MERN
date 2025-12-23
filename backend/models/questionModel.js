const mongoose = require("mongoose");

const questionSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    language_id: { type: String, required: true },
    category: { type: String, required: true },
    desc: { type: String, required: true },
    options: { type: [String], required: true }, // tableau de strings
    correct_answer: { type: Number, required: true },
    image: { type: String },
  },
  { timestamps: true }
);

const Question = mongoose.model("Question", questionSchema);
module.exports = Question;
