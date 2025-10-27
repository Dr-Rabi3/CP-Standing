import mongoose from "mongoose";

const traineePerformanceSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, refPath: "performances.itemType" }, // ref to Sheet or Contest
  itemType: { type: String, enum: ["Sheet", "Contest"], required: true },
  problemsSolved: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
});

const traineeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    handle: { type: String, required: true, unique: true },
    titlePhoto: {type: String, required: true},
    coach: { type: String },
    rating: { type: Number, default: 0 },
    color: { type: String, default: "gray" },
    pointsCollected: { type: Number, default: 0 },
    performances: [traineePerformanceSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Trainee", traineeSchema);
