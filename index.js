import express, { response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
// import audioRoutes from "./routes/audioRoutes.js";
import  dbConnection  from "./db/db.connect.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
dbConnection();
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true); 
    },
    credentials: true, 
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.json({ message: "API working ✅" });
});
app.use("/api/users", userRoutes);
// app.use("/audio", audioRoutes);

// app.listen(PORT, () => {
//   console.log(`Server running on port ................... ${PORT}`);
// });
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
