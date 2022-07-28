import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import passport from "passport";
import compression from "compression";
import dotenv from "dotenv";

import routes from "./routes";
import filterRouter from "./routers/filters";
import authRouter from "./routers/auth";
import offerRouter from "./routers/offers";
import practiceHouseRouter from "./routers/practice-houses";
import communityRouter from "./routers/community";
import userRouter from "./routers/users";
import advertisementRouter from "./routers/advertisements";

dotenv.config();

const app = express();

// third-party middlewares
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(passport.initialize());

// routers
app.use(routes.FILTERS, filterRouter);
app.use(routes.AUTH, authRouter);
app.use(routes.OFFERS, offerRouter);
app.use(routes.PRACTICE_HOUSES, practiceHouseRouter);
app.use(routes.COMMUNITY, communityRouter);
app.use(routes.USERS, userRouter);
app.use(routes.ADVERTISEMENTS, advertisementRouter);

export default app;
