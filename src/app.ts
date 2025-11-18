import express, { Request, Response } from "express"
import authRoutes from "./routes/authRoutes"
import cookieParser from "cookie-parser";
import { authenticate } from "./middlewares/authMiddleware";
import generalInfo from "./routes/generalInfoRoute"
import staffInfo from "./routes/staffInfoRoute"
import financialInfo from "./routes/financialInfoRoute"
import buildingInfo from "./routes/buildingInfoRoute"
import equipmentInfo from "./routes/equipmentInfoRoute"
import instituteDocs from "./routes/InstituteDocRoute"
import partnerInfo from "./routes/partnerInfoRoute"

import cors from "cors";



import { db } from "./config/db";

export const app = express();


app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173" , "https://ttb.digipakistan.com"], // allowed origins
    methods: ["GET", "POST", "PUT", "DELETE",  'OPTIONS', 'PATCH'], // allowed methods
    credentials: true, // allow cookies if needed
  })
);



app.use(express.json());
app.use(cookieParser());






app.use("/api/auth", authRoutes)
app.use("/api", generalInfo)
app.use("/api", staffInfo)
app.use("/api", financialInfo)
app.use("/api", buildingInfo)
app.use("/api", equipmentInfo)
app.use("/api", instituteDocs)
app.use("/api", partnerInfo)

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.get("/", (req: Request, res: Response) => {
  res.send({message: "Hello TypeScript + Node.js!"});
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

