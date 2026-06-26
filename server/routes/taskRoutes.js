import express from "express";
import {
  completeTask,
  createTask,
  deleteTask,
  getTask,
  getTasks,
  updateTask
} from "../controllers/taskController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.route("/").get(getTasks).post(createTask);
router.route("/:id").get(getTask).put(updateTask).delete(deleteTask);
router.patch("/:id/complete", completeTask);

export default router;
