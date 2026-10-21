import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});

// Start server after DB connection
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () =>
      console.log(`Server is listening on port ${process.env.PORT}`)
    );
  })
  .catch((error) => {
    console.log("MongoDB connection failed !!!", error);
  });
