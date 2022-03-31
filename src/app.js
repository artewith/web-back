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

export default app;
