import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: 160
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: ""
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
      index: true
    },
    category: {
      type: String,
      enum: ["Development", "Meeting", "Documentation", "Testing", "Research", "Client Work", "Others"],
      default: "Development",
      index: true
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
      index: true
    },
    dueDate: {
      type: Date,
      required: true,
      index: true
    },
    dueTime: {
      type: String,
      required: true
    },
    reminderTime: {
      type: Date,
      default: null,
      index: true
    },
    reminderMinutesBefore: {
      type: Number,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

taskSchema.virtual("dueAt").get(function getDueAt() {
  const datePart = this.dueDate.toISOString().slice(0, 10);
  return new Date(`${datePart}T${this.dueTime}:00`);
});

taskSchema.set("toJSON", { virtuals: true });
taskSchema.set("toObject", { virtuals: true });

const Task = mongoose.model("Task", taskSchema);

export default Task;
