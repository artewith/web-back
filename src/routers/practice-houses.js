import express from "express";

import routes from "../routes";
import { checkIsAuthenticated } from "../middlewares/auth";
import { initializeUpload } from "../utils/s3multer";

import {
  detailHouse,
  listHouses,
  recommendHouses,
  createHouse,
  updateHouse,
  deleteHouse,
  fulfillHouse,
  putHouseImage,
  putRoomImages,
} from "../controllers/pratice-houses";

const router = express.Router();
const uploadHouse = initializeUpload("practice_houses");
const uploadRooms = initializeUpload("rooms");

router.get(routes.HOUSE_ID, checkIsAuthenticated, detailHouse);
router.get(routes.ROOT, listHouses);
router.get(routes.HOUSE_RECOMMEND, recommendHouses);
router.post(routes.ROOT, checkIsAuthenticated, createHouse);
router.patch(routes.HOUSE_ID, checkIsAuthenticated, updateHouse);
router.patch(
  routes.HOUSE_IMAGE,
  checkIsAuthenticated,
  uploadHouse.single("single"),
  putHouseImage
);
router.patch(
  routes.ROOM_IMAGES,
  checkIsAuthenticated,
  uploadRooms.array("multiple"),
  putRoomImages
);

router.patch(routes.HOUSE_FULFILL, checkIsAuthenticated, fulfillHouse);
router.delete(routes.HOUSE_ID, checkIsAuthenticated, deleteHouse);

export default router;
