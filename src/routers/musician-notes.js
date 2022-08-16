import express from "express";

import routes from "../routes";
import { checkIsAdmin, validate } from "../middlewares/auth";
import {
  detailMusicianNote,
  detailMusicianProfile,
  listAllMainPage,
  listAllMusicianChannel,
  listMusicianNotes,
  recommendMusicianNotes,
  recommendMusicians,
  createMusicianNote,
  updateMusicianNote,
  deleteMusicianNote,
  putMusicianNoteImage,
} from "../controllers/musician-notes";
import { initializeUpload } from "../utils/s3multer";

const { ROOT, ALL, IMAGE, NOTE_ID, RECOMMEND, MUSICIANS, MUSICIAN_ID } = routes;
const router = express.Router();
const upload = initializeUpload("musician_notes");

// list
router.get(ROOT, listMusicianNotes);
router.get(ALL, listAllMainPage);
// recommend notes
router.get(NOTE_ID + RECOMMEND, recommendMusicianNotes);
// recommend musicians
router.get(MUSICIANS, recommendMusicians);
// detail
router.get(NOTE_ID, validate, detailMusicianNote);
router.get(MUSICIAN_ID + ALL, listAllMusicianChannel);
router.get(MUSICIAN_ID, detailMusicianProfile);

// permission level : only for admin
// create
router.post(ROOT, validate, checkIsAdmin, createMusicianNote);
// update
router.patch(NOTE_ID, validate, checkIsAdmin, updateMusicianNote);
// delete
router.delete(NOTE_ID, validate, checkIsAdmin, deleteMusicianNote);
// image(s3)
router.post(
  IMAGE,
  validate,
  checkIsAdmin,
  upload.single("single"),
  putMusicianNoteImage
);

export default router;
