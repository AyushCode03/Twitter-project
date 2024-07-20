import express from "express";
import { authorizedUser } from "../middleware/protectedRoute.js";
import {
  commentOnPost,
  createPost,
  deletePost,
  getAllPosts,
  getFollowingPosts,
  getLikedPosts,
  getUserPosts,
  likeUnlikePost,
} from "../controllers/postController.js";

const router = express.Router();

router.post("/create", authorizedUser, createPost); //
router.delete("/:id", authorizedUser, deletePost); //
router.post("/comment/:id", authorizedUser, commentOnPost); //
router.get("/likes/:id", authorizedUser, getLikedPosts); //
router.post("/like/:id", authorizedUser, likeUnlikePost); //
router.get("/all", authorizedUser, getAllPosts); //
router.get("/following", authorizedUser, getFollowingPosts); //
router.get("/user/:username", authorizedUser, getUserPosts); //
// router.post("/retweet/:id", authorizedUser, retweetPost); //

export default router;
