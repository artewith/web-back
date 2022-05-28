import express from "express";

import {
  offerFilters,
  practiceHouseFilters,
  userFilters,
} from "../controllers/filters";
import routes from "../routes";

const router = express.Router();

router.get(routes.OFFERS, offerFilters);
router.get(routes.PRACTICE_HOUSES, practiceHouseFilters);
router.get(routes.USERS, userFilters);

export default router;
