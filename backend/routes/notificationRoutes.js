import express from "express";
import { authorizedUser } from "../middleware/protectedRoute.js";
import {
  deleteNotifications,
  getNotifications,
} from "../controllers/notificationController.js";
const router = express.Router();

router.get("/", authorizedUser, getNotifications);
router.delete("/", authorizedUser, deleteNotifications);

export default router;
