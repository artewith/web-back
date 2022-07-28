import express from "express";
import dotenv from "dotenv";

import routes from "../routes";
import { validate } from "../middlewares/auth";
import { initializeUpload } from "../utils/s3multer";
import { detailUser, updateUser, putUserImage } from "../controllers/users";

dotenv.config();

const router = express.Router();
const upload = initializeUpload("user_profile");

router.get(routes.ROOT, validate, detailUser);
router.patch(routes.REGISTER, validate, updateUser);
router.patch(routes.IMAGE, validate, upload.single("single"), putUserImage);

export default router;
