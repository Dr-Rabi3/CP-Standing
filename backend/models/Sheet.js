import mongoose from "mongoose";

const problemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  alpha: { type: String, required: true }, // e.g., 'A', 'B', 'C'
});

const sheetSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    duration: { type: Number, required: true }, // in minutes or hours
    cfContestId: { type: String }, // Optional: Codeforces contest ID (e.g., "1234")
    addedAt: { type: Date, default: Date.now },
    problems: [problemSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Sheet", sheetSchema);
