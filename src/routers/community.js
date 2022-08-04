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
  putCommunityContentImage,
} from "../controllers/community";
import { initializeUpload } from "../utils/s3multer";

const { ROOT, POST, POST_COMMENTS, POST_COMMENT, IMAGE } = routes;
const router = express.Router();
const upload = initializeUpload("community");

// community posts
router.get(ROOT, listPosts);
router.get(POST, validate, detailPost);
router.post(ROOT, validate, createPost);
router.patch(POST, validate, updatePost);
router.delete(POST, validate, deletePost);

// community comments
router.get(POST_COMMENTS, validate, listComments);
router.post(POST_COMMENTS, validate, createComment);
router.patch(POST_COMMENT, validate, updateComment);
router.delete(POST_COMMENT, validate, deleteComment);

// image
router.post(IMAGE, validate, upload.single("single"), putCommunityContentImage);

export default router;
