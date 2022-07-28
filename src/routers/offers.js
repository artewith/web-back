import express from "express";

import routes from "../routes";
import { validate } from "../middlewares/auth";
import { initializeUpload } from "../utils/s3multer";
import {
  detailOffer,
  listOffers,
  recommendOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  fulfillOffer,
  putOfferImage,
} from "../controllers/offers";

const router = express.Router();
const upload = initializeUpload("offers");

router.get(routes.OFFER_ID, validate, detailOffer);
router.get(routes.ROOT, listOffers);
router.get(routes.OFFER_RECOMMEND, recommendOffers);
router.post(routes.ROOT, validate, createOffer);
router.patch(routes.OFFER_ID, validate, updateOffer);
router.patch(
  routes.OFFER_IMAGE,
  validate,
  upload.single("single"),
  putOfferImage
);
router.patch(routes.OFFER_FULFILL, validate, fulfillOffer);
router.delete(routes.OFFER_ID, validate, deleteOffer);

export default router;
