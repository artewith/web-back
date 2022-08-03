import express from "express";

import routes from "../routes";
import { validate } from "../middlewares/auth";
import { initializeUpload } from "../utils/s3multer";
import {
  detailLessonResume,
  detailAccompanistResume,
  detailTutorRecruit,
  detailAccompanistRecruit,
  listAccompanistResumes,
  listAccompanistRecruits,
  listLessonResumes,
  listTutorRecruits,
  recommendLessonResumes,
  recommendAccompanistResumes,
  recommendTutorRecruits,
  recommendAccompanistRecruits,
  createLessonResume,
  createAccompanistResume,
  createAccompanistRecruit,
  createTutorRecruit,
  updateLessonResume,
  updateAccompanistResume,
  updateTutorRecruit,
  updateAccompanistRecruit,
  deletelessonResume,
  deleteAccompanistResume,
  deleteTutorRecruit,
  deleteAccompanistRecruit,
  putOfferImage,
} from "../controllers/offers";

const {
  LESSON_RESUMES,
  LESSON_RESUME,
  ACCOMPANIST_RESUMES,
  ACCOMPANIST_RESUME,
  TUTOR_RECRUITS,
  TUTOR_RECRUIT,
  ACCOMPANIST_RECRUITS,
  ACCOMPANIST_RECRUIT,
  RECOMMEND,
  IMAGE,
} = routes;
const router = express.Router();
const upload = initializeUpload("offers");

// detail
router.get(LESSON_RESUME, validate, detailLessonResume);
router.get(ACCOMPANIST_RESUME, validate, detailAccompanistResume);
router.get(TUTOR_RECRUIT, detailTutorRecruit);
router.get(ACCOMPANIST_RECRUIT, detailAccompanistRecruit);

// list
router.get(LESSON_RESUMES, listLessonResumes);
router.get(ACCOMPANIST_RESUMES, listAccompanistResumes);
router.get(TUTOR_RECRUITS, listTutorRecruits);
router.get(ACCOMPANIST_RECRUITS, listAccompanistRecruits);

// recommend
router.get(LESSON_RESUME + RECOMMEND, recommendLessonResumes);
router.get(ACCOMPANIST_RESUME + RECOMMEND, recommendAccompanistResumes);
router.get(TUTOR_RECRUIT + RECOMMEND, recommendTutorRecruits);
router.get(ACCOMPANIST_RECRUIT + RECOMMEND, recommendAccompanistRecruits);

// create
router.post(LESSON_RESUMES, validate, createLessonResume);
router.post(ACCOMPANIST_RESUMES, validate, createAccompanistResume);
router.post(TUTOR_RECRUITS, validate, createTutorRecruit);
router.post(ACCOMPANIST_RECRUITS, validate, createAccompanistRecruit);

// update
router.patch(LESSON_RESUME, validate, updateLessonResume);
router.patch(ACCOMPANIST_RESUME, validate, updateAccompanistResume);
router.patch(TUTOR_RECRUIT, validate, updateTutorRecruit);
router.patch(ACCOMPANIST_RECRUIT, validate, updateAccompanistRecruit);

// delete
router.delete(LESSON_RESUME, validate, deletelessonResume);
router.delete(ACCOMPANIST_RESUME, validate, deleteAccompanistResume);
router.delete(TUTOR_RECRUIT, validate, deleteTutorRecruit);
router.delete(ACCOMPANIST_RECRUIT, validate, deleteAccompanistRecruit);

// image
router.post(IMAGE, validate, upload.single("single"), putOfferImage);

export default router;
