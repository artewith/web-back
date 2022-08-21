import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import dotenv from "dotenv";

import corsOptions from "./utils/corsOptions";
import routes from "./routes";
import authRouter from "./routers/auth";
import offerRouter from "./routers/offers";
import practiceHouseRouter from "./routers/practice-houses";
import communityRouter from "./routers/community";
import userRouter from "./routers/users";
import advertisementRouter from "./routers/advertisements";
import musicianNoteRouter from "./routers/musician-notes";
import musicianInterviewRouter from "./routers/musician-interviews";

dotenv.config();

const app = express();
const v1 = express.Router();

// third-party middlewares
app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// routers
app.use(routes.API_VERSION_1, v1);
v1.use(routes.AUTH, authRouter);
v1.use(routes.OFFERS, offerRouter);
v1.use(routes.PRACTICE_HOUSES, practiceHouseRouter);
v1.use(routes.COMMUNITY, communityRouter);
v1.use(routes.USERS, userRouter);
v1.use(routes.ADVERTISEMENTS, advertisementRouter);
v1.use(routes.MUSICIAN_NOTES, musicianNoteRouter);
v1.use(routes.MUSICIAN_INTERVIEWS, musicianInterviewRouter);

export default app;
