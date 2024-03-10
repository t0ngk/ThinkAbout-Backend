import express from "express";
import cors from "cors";
import authRoutes from "./src/routes/auth";
import questionRoutes from "./src/routes/question";

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.get("/", (_, res) => {
  res.send("ThinkAbout API Online!");
});

app.use("/auth", authRoutes);
app.use("/question", questionRoutes);

app.listen(port, () => {
  console.log(`ThinkAbout App is running at http://localhost:${port}`);
});
