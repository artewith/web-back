import express from "express";

import routes from "../routes";
import { checkIsAuthenticated } from "../middlewares/auth";
import {
  detailOffer,
  listOffers,
  recommendOffers,
  createOffer,
  updateOffer,
  deleteOffer,
} from "../controllers/offers";

const router = express.Router();

router.get(routes.OFFER_ID, checkIsAuthenticated, detailOffer);

router.get(routes.ROOT, listOffers);

router.get(routes.OFFER_RECOMMEND, recommendOffers);

router.post(routes.ROOT, checkIsAuthenticated, createOffer);

router.patch(routes.OFFER_ID, checkIsAuthenticated, updateOffer);

router.delete(routes.OFFER_ID, checkIsAuthenticated, deleteOffer);

export default router;
