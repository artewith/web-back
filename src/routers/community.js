import express from "express";

import routes from "../routes";
import { validate } from "../middlewares/auth";
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
router.get(routes.POST_ID, validate, detailPost);
router.post(routes.ROOT, validate, createPost);
router.patch(routes.POST_ID, validate, updatePost);
router.delete(routes.POST_ID, validate, deletePost);

router.get(routes.POST_COMMENTS, validate, listComments);
router.post(routes.POST_COMMENTS, validate, createComment);
router.patch(routes.POST_COMMENT_ID, validate, updateComment);
router.delete(routes.POST_COMMENT_ID, validate, deleteComment);

export default router;
