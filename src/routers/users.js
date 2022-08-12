import express from "express";
import dotenv from "dotenv";

import routes from "../routes";
import { validate } from "../middlewares/auth";
import { initializeUpload } from "../utils/s3multer";
import {
  detailUser,
  putUserImage,
  updateUserProfile,
  updateInitialUserProfile,
} from "../controllers/users";

dotenv.config();

const router = express.Router();
const upload = initializeUpload("user_profile");

// detail
router.get(routes.PROFILE, validate, detailUser);
// update
router.patch(routes.PROFILE, validate, updateUserProfile);
router.patch(
  routes.PROFILE + routes.INITIAL,
  validate,
  updateInitialUserProfile
);
// image
router.post(
  routes.PROFILE + routes.IMAGE,
  validate,
  upload.single("single"),
  putUserImage
);

export default router;
