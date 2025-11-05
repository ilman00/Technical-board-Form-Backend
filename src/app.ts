import express, { Request, Response } from "express"
import authRoutes from "./routes/authRoutes"
import cookieParser from "cookie-parser";
import { authenticate } from "./middlewares/authMiddleware";
import generalInfo from "./routes/generalInfoRoute"
import staffInfo from "./routes/staffInfoRoute"
import financialInfo from "./routes/financialInfoRoute"
import buildingInfo from "./routes/buildingInfoRoute"

import { db } from "./config/db";

export const app = express();




app.use(express.json());
app.use(cookieParser());






app.use("/api/auth", authRoutes)
app.use("/api", generalInfo)
app.use("/api", staffInfo)
app.use("/api", financialInfo)
app.use("/api", buildingInfo)

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.get("/api", authenticate, (req: Request, res: Response) => {
  const user = req.user?.userId
  res.send({message: "Hello TypeScript + Node.js!", user});
});


app.get("/api/me", authenticate, (req: Request, res: Response) => {

  try {
    console.log("HIT /api/me in app.ts");

    const user = req.user?.userId
    const query = "SELECT * FROM affiliation_forms where user_id=? ";
    const values = [user]
    const result = db.query(query, values)
    res.status(201).json({UserId: user,Result:result})
  } catch (error: any) {
    console.error("Error saving building info:", error);
    res.status(500).json({ error: "Internal server error." });
  }

})

