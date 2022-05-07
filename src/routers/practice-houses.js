import express from "express";

import routes from "../routes";
import { checkIsAuthenticated } from "../middlewares/auth";
import {
  detailHouse,
  listHouses,
  recommendHouses,
  createHouse,
  updateHouse,
  deleteHouse,
} from "../controllers/pratice-houses";

const router = express.Router();

router.get(routes.HOUSE_ID, checkIsAuthenticated, detailHouse);
router.get(routes.ROOT, listHouses);
router.get(routes.HOUSE_RECOMMEND, recommendHouses);
router.post(routes.ROOT, checkIsAuthenticated, createHouse);
router.patch(routes.HOUSE_ID, checkIsAuthenticated, updateHouse);
router.delete(routes.HOUSE_ID, checkIsAuthenticated, deleteHouse);

export default router;
