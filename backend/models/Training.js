import mongoose from "mongoose";

const trainingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], required: true },
    type: { type: String, enum: ["camp", "training"], default: "training" },
    startDate: { type: Date, required: true },
    sheets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Sheet" }],
    contests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Contest" }],
    trainees: [{ type: mongoose.Schema.Types.ObjectId, ref: "Trainee" }],
  },
  { timestamps: true }
);

export default mongoose.model("Training", trainingSchema);
