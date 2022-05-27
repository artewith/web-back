import express from "express";

import routes from "../routes";
import { checkIsAuthenticated } from "../middlewares/auth";
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

router.get(routes.OFFER_ID, checkIsAuthenticated, detailOffer);
router.get(routes.ROOT, listOffers);
router.get(routes.OFFER_RECOMMEND, recommendOffers);
router.post(routes.ROOT, checkIsAuthenticated, createOffer);
router.patch(routes.OFFER_ID, checkIsAuthenticated, updateOffer);
router.patch(
  routes.OFFER_IMAGE,
  checkIsAuthenticated,
  upload.single("single"),
  putOfferImage
);
router.patch(routes.OFFER_FULFILL, checkIsAuthenticated, fulfillOffer);
router.delete(routes.OFFER_ID, checkIsAuthenticated, deleteOffer);

export default router;
