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
passport.deserializeUser((userSession, cb) => {
  process.nextTick(async () => {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
      const [result] = await connection.query(
        "SELECT * FROM users WHERE sns_id = ? AND sns_api_id IN (SELECT id FROM sns_api WHERE name = ?);",
        [userSession.id, "kakao"]
      );
      if (result[0]) {
        return cb(null, userSession);
      } else {
        throw Error("NO_USER");
      }
    } catch (error) {
      console.log(error.message);
      return cb(null, false);
    } finally {
      connection.release();
    }
  });
});

// routers
app.use(routes.FILTERS, filterRouter);
app.use(routes.AUTH, authRouter);

export default app;
