const allowedOrigins = [process.env.WHITE_LIST_1, process.env.WHITE_LIST_2];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  // methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
};

export default corsOptions;
