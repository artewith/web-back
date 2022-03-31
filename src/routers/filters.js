import express from "express";
import filterController from "../controllers/filters";

const router = express.Router();

router.get("/", filterController);

export default router;
