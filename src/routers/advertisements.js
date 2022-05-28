import express from "express";

import routes from "../routes";
import { randomAdvertisement } from "../controllers/advertisements";

const router = express.Router();

router.get(routes.RANDOM, randomAdvertisement);

export default router;
