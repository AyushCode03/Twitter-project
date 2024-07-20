import express from "express";
const router = express.Router();
import {
  userProfile,
  followingUser,
  suggestedUsers,
  updateUserProfile,
} from "../controllers/userController.js";
import { authorizedUser } from "../middleware/protectedRoute.js";

router.get("/profile/:username", authorizedUser, userProfile);
router.get("/suggested", authorizedUser, suggestedUsers);
router.post("/follow/:id", authorizedUser, followingUser);
router.post("/update", authorizedUser, updateUserProfile);

export default router;
