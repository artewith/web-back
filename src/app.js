import express from "express";
import session from "express-session";
import MySQLStore from "express-mysql-session";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import passport from "passport";
import compression from "compression";
import dotenv from "dotenv";

import pool from "./db";
import routes from "./routes";
import filterRouter from "./routers/filters";
import authRouter from "./routers/auth";
import offerRouter from "./routers/offers";
import practiceHouseRouter from "./routers/practice-houses";
import communityRouter from "./routers/community";

dotenv.config();

const app = express();

// third-party middlewares
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: new MySQLStore({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
    }),
  })
);
app.use(passport.initialize());
app.use(passport.authenticate("session"));
app.use(passport.session());

// passport middleware
passport.serializeUser((user, cb) => {
  process.nextTick(() => {
    return cb(null, user);
  });
});
passport.deserializeUser((user, cb) => {
  process.nextTick(async () => {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
      const [[userRecord]] = await connection.query(
        "SELECT * FROM users WHERE sns_id = ? AND sns_api_id IN (SELECT id FROM sns_api WHERE name = ?);",
        [user.id, user.provider]
      );
      if (userRecord) {
        return cb(null, user);
      } else {
        return cb(null, null);
      }
    } catch (error) {
      return cb(error, null);
    } finally {
      connection.release();
    }
  });
});

// routers
app.use(routes.FILTERS, filterRouter);
app.use(routes.AUTH, authRouter);
app.use(routes.OFFERS, offerRouter);
app.use(routes.PRACTICE_HOUSES, practiceHouseRouter);
app.use(routes.COMMUNITY, communityRouter);

export default app;
