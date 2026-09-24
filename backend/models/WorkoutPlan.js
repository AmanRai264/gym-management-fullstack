const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    muscleGroup: { type: String },
    sets: { type: Number },
    reps: { type: String },
    weight: { type: String },
    duration: { type: String },
    restTime: { type: String },
    instructions: { type: String },
  },
  { _id: false }
);

const workoutPlanSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "Weight Loss",
        "Muscle Gain",
        "Strength",
        "Beginner",
        "Intermediate",
        "Advanced",
        "Cardio",
        "Functional Training",
      ],
    },
    member: { type: mongoose.Schema.Types.ObjectId, ref: "Member" },
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer" },
    exercises: [exerciseSchema],
    status: { type: String, enum: ["active", "completed", "archived"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WorkoutPlan", workoutPlanSchema);
