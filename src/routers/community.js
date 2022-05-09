import express from "express";

import routes from "../routes";
import { checkIsAuthenticated } from "../middlewares/auth";
import {
  listPosts,
  detailPost,
  createPost,
  updatePost,
  deletePost,
  listComments,
  createComment,
  updateComment,
  deleteComment,
} from "../controllers/community";

const router = express.Router();

router.get(routes.ROOT, listPosts);
router.get(routes.POST_ID, checkIsAuthenticated, detailPost);
router.post(routes.ROOT, checkIsAuthenticated, createPost);
router.patch(routes.POST_ID, checkIsAuthenticated, updatePost);
router.delete(routes.POST_ID, checkIsAuthenticated, deletePost);

router.get(routes.POST_COMMENTS, checkIsAuthenticated, listComments);
router.post(routes.POST_COMMENTS, checkIsAuthenticated, createComment);
router.patch(routes.POST_COMMENT_ID, checkIsAuthenticated, updateComment);
router.delete(routes.POST_COMMENT_ID, checkIsAuthenticated, deleteComment);

export default router;
