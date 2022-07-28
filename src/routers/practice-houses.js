import express from "express";

import routes from "../routes";
import { validate } from "../middlewares/auth";
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

router.get(routes.HOUSE_ID, validate, detailHouse);
router.get(routes.ROOT, listHouses);
router.get(routes.HOUSE_RECOMMEND, recommendHouses);
router.post(routes.ROOT, validate, createHouse);
router.patch(routes.HOUSE_ID, validate, updateHouse);
router.patch(
  routes.HOUSE_IMAGE,
  validate,
  uploadHouse.single("single"),
  putHouseImage
);
router.patch(
  routes.ROOM_IMAGES,
  validate,
  uploadRooms.array("multiple"),
  putRoomImages
);

router.patch(routes.HOUSE_FULFILL, validate, fulfillHouse);
router.delete(routes.HOUSE_ID, validate, deleteHouse);

export default router;
