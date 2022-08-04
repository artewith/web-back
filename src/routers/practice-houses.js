import express from "express";

import routes from "../routes";
import { validate } from "../middlewares/auth";
import {
  detailHouse,
  listHouses,
  recommendHouses,
  createHouse,
  updateHouse,
  deleteHouse,
  putHouseImage,
  putRoomImage,
  putRoomImages,
} from "../controllers/pratice-houses";
import { initializeUpload } from "../utils/s3multer";

const router = express.Router();
const uploadHouse = initializeUpload("practice_houses");
const uploadRooms = initializeUpload("rooms");

router.get(routes.HOUSE_ID, validate, detailHouse);
router.get(routes.ROOT, listHouses);
router.get(routes.HOUSE_RECOMMEND, recommendHouses);
router.post(routes.ROOT, validate, createHouse);
router.patch(routes.HOUSE_ID, validate, updateHouse);
router.post(
  routes.HOUSE_IMAGE,
  validate,
  uploadHouse.single("single"),
  putHouseImage
);
router.post(
  routes.ROOM_IMAGE,
  validate,
  uploadRooms.single("single"),
  putRoomImage
);
router.post(
  routes.ROOM_IMAGES,
  validate,
  uploadRooms.array("multiple"),
  putRoomImages
);

router.delete(routes.HOUSE_ID, validate, deleteHouse);

export default router;
