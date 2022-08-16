import express from "express";

import routes from "../routes";
import { checkIsAdmin, validate } from "../middlewares/auth";
import { initializeUpload } from "../utils/s3multer";
import {
  createMusicianInterview,
  deleteMusicianInterview,
  detailMusicianInterview,
  listMusicianInterviews,
  putMusicianInterviewImage,
  recommendMusicianInterviews,
  updateMusicianInterview,
} from "../controllers/musician-interviews";

const { ROOT, INTERVIEW_ID, IMAGE, RECOMMEND } = routes;
const router = express.Router();
const upload = initializeUpload("musician_interviews");

// list
router.get(ROOT, listMusicianInterviews);
// recommend
router.get(INTERVIEW_ID + RECOMMEND, recommendMusicianInterviews);
// detail
router.get(INTERVIEW_ID, validate, detailMusicianInterview);

// permission level : only for admin
// create
router.post(ROOT, validate, checkIsAdmin, createMusicianInterview);
// update
router.patch(INTERVIEW_ID, validate, checkIsAdmin, updateMusicianInterview);
// delete
router.delete(INTERVIEW_ID, validate, checkIsAdmin, deleteMusicianInterview);
// image(s3)
router.post(
  IMAGE,
  validate,
  checkIsAdmin,
  upload.single("single"),
  putMusicianInterviewImage
);

export default router;
