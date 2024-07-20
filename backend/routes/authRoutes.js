import express from "express";
import {
  login,
  logout,
  signup,
  validUser,
} from "../controllers/authController.js";
import { authorizedUser } from "../middleware/protectedRoute.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/user", authorizedUser, validUser);

export default router;
