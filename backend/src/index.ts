import express, { Request, Response } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {z} from "zod";
import cors from "cors";
import Razorpay from "razorpay";
import crypto from "crypto";
import {ContentModel, UserModel,LinkModel} from "./models/db.js";
import router from "./routes/chat.js";
import {JWT_PASSWORD} from "./config.js";
import {authMiddleware} from "./middleware.js";
import { random } from "./utils.js";
import generateOpenAiResponse from "./utils/openai.js";
const app=express();
app.use(express.json());
import path from "path";
import dotenv from "dotenv";

import { fileURLToPath } from "url";
import { dirname, resolve } from "path";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({
  path: resolve(__dirname, "../.env"),
});

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

const razorpayClient =
  razorpayKeyId && razorpayKeySecret
    ? new Razorpay({
        key_id: razorpayKeyId,
        key_secret: razorpayKeySecret,
      })
    : null;

const mongoUrl = process.env.MONGO_URL;
if (!mongoUrl) {
  console.error("MONGO_URL is not configured.");
  process.exit(1);
}

mongoose.connect(mongoUrl).then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error(" MongoDB connection error:", err);
  });

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.post("/api/v1/signup", async (req: Request, res: Response) => {
    //left zod validation,hashing
  try{
      const signupSchema = z.object({
      username:z.string().min(3).max(20),
      email: z.string().email(),
      password:z.string().min(4).max(100)
    })
    const validation = signupSchema.safeParse(req.body);
    if(!validation.success){
      return res.status(400).json({
        message:"Invalid input",
        errors:validation.error
      });
    }
    const {username,email,password}=validation.data;
    const hashedPassword=await bcrypt.hash(password,5);
    
    const newUser=await UserModel.create({
        username:username,
        email:email,
        password:hashedPassword,
        isUpgraded: false,
        currentPlan: "Starter",
        billingCycle: "yearly",
    });
    res.json({
      message: "User is signed up",
      username: newUser.username,
      email: newUser.email
    });
  }catch(e){
    res.status(409).json({
      message:"User already exists"
    })
  }
});

app.post("/api/v1/signin",async (req, res) => {
    try {
    const email=req.body.email;
    const password=req.body.password;
    const existingUser=await UserModel.findOne({
      email
    });
    if(!existingUser){
      res.status(403).json({
        message:"User does not exits in out db"
      })
      return
    }
    if (!existingUser.password) {
         return res.status(500).json({ message: "Password is missing for this user in DB" });
      }
     
    const passwordMatch=await bcrypt.compare(password,existingUser.password);
    if(passwordMatch){
      const token=jwt.sign({
        id:existingUser._id.toString()
      },JWT_PASSWORD);

      res.json({
      token: token,
      username: existingUser.username,
      email: existingUser.email,
      isUpgraded: Boolean((existingUser as any).isUpgraded),
      currentPlan: (existingUser as any).currentPlan || "Starter",
      billingCycle: (existingUser as any).billingCycle || "yearly",
      });

    }else{
      res.status(403).json({
        message:"Invalid"
      })
    } } catch (e) {
    console.error("Signin failed:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/v1/content",authMiddleware, async (req, res) => {
   try {
    const link=req.body.link;
    const type=req.body.type;
    await ContentModel.create({
      link,
      type,
      title:req.body.title,
      userId:req.userId,
      tags:[]
    })
    return res.json({
        message:"Content added"
    })
    } catch (err) {
    console.error("Add content failed:", err);
    res.status(500).json({ message: "Failed to add content" });
  }
});

app.get("/api/v1/content",authMiddleware, async (req, res) => {
    try {
      const userId=req.userId;
      const content=await ContentModel.find({
          userId:userId
      }).populate("userId","username");
      res.json({
        content
      });
    } catch (error) {
      console.error("Fetch content failed:", error);
      res.status(500).json({ message: "Failed to fetch content" });
    }

});


interface AuthRequest extends Request {
  userId?: string;
}



app.delete("/api/v1/content/:contentId", authMiddleware, async (req: AuthRequest, res) => {
  const { contentId } = req.params;
  const userId = req.userId;
  if (!contentId || !userId) {
    return res.status(400).json({ message: "Missing contentId or userId" });
  }

  try {
    const content = await ContentModel.findById(contentId);

    if (!content) {
      console.log(" Content not found");
      return res.status(404).json({ message: "Content not found" });
    }

    // String compare ensures match even if one side is ObjectId
    if (String(content.userId) !== String(userId)) {
      console.log(" Unauthorized delete attempt");
      return res.status(403).json({ message: "Unauthorized" });
    }

    await content.deleteOne(); // no filter mismatch now
    return res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(" Delete failed:", err);
    return res.status(500).json({ message: "Failed to delete content" });
  }
});


app.post("/api/v1/brain/share",authMiddleware, async (req, res) => {
    try {
    const share =req.body.share;
    if(share==true){
     const existingLink=await LinkModel.findOne({
      userId:req.userId
     }
     )
     if(existingLink){
        return res.json({
        hash:existingLink.hash
      })
     }
      const hash=random(10);
      await LinkModel.create({
        userId:req.userId,
        hash:hash
      })
       res.json({
        message:"/share/"+ hash
    })
  
    
  }else{
       await  LinkModel.deleteOne({
          userId:req.userId
        });
         res.json({
        message:"Removed links"
      })
    }
    } catch (err) {
    console.error("Share brain failed:", err);
    res.status(500).json({ message: "Something went wrong while sharing brain" });
  }
   
});


app.get("/api/v1/brain/:shareLink", async (req, res) => {
   try {
  const hash=req.params.shareLink;
  const link = await LinkModel.findOne({
      hash
  });
  if(!link) {
    res.status(404).json({
      message:"Sorry incorrect input"
    });
    return;
  }
  const content=await ContentModel.find({
      userId:link.userId
  });
  const user=await UserModel.findOne({
    _id:link.userId
  });

   if(!user) {
    res.status(404).json({
      message:"User not found"
    });
    return;
  }

  res.json({
    username:user.username,
    content:content
  })
   } catch (err) {
    console.error("Share link fetch failed:", err);
    res.status(500).json({ message: "Failed to fetch shared brain" });
  }
}); 

app.post("/api/v1/chat", async(req,res)=>{
    const {message} =req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ message: "Message is required" });
    }
    
    try{
      const assiantReply= await generateOpenAiResponse(message);
      console.log(assiantReply);
      res.json({reply:assiantReply || "Unable to generate response right now."});
    }catch(e){
      res.status(500).json({message:"Error will sending message"});
    }
});

app.post("/api/v1/payments/razorpay/order", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!razorpayClient || !razorpayKeyId) {
      return res.status(500).json({ message: "Razorpay is not configured" });
    }

    const schema = z.object({
      amountInPaise: z.number().int().positive(),
      planName: z.string().min(1),
      billingCycle: z.enum(["monthly", "yearly"]),
    });

    const validation = schema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: "Invalid order payload",
        errors: validation.error,
      });
    }

    const { amountInPaise, planName, billingCycle } = validation.data;

    const receipt = `rcpt_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;

    const order = await razorpayClient.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        planName,
        billingCycle,
        userId: req.userId ?? null,
      },
    });

    return res.json({
      keyId: razorpayKeyId,
      order,
    });
  } catch (error) {
    console.error("Failed to create Razorpay order:", error);
    return res.status(500).json({ message: "Failed to create payment order" });
  }
});

app.get("/api/v1/user/plan", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await UserModel.findById(req.userId).select("currentPlan isUpgraded billingCycle upgradedAt");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      currentPlan: (user as any).currentPlan || "Starter",
      isUpgraded: Boolean((user as any).isUpgraded),
      billingCycle: (user as any).billingCycle || "yearly",
      upgradedAt: (user as any).upgradedAt || null,
    });
  } catch (error) {
    console.error("Failed to fetch current plan:", error);
    return res.status(500).json({ message: "Failed to fetch current plan" });
  }
});

app.post("/api/v1/payments/razorpay/verify", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!razorpayKeySecret) {
      return res.status(500).json({ message: "Razorpay secret is not configured" });
    }

    const schema = z.object({
      razorpay_order_id: z.string().min(1),
      razorpay_payment_id: z.string().min(1),
      razorpay_signature: z.string().min(1),
      planName: z.enum(["Starter", "Pro", "Team"]),
      billingCycle: z.enum(["monthly", "yearly"]),
    });

    const validation = schema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: "Invalid payment verification payload",
        errors: validation.error,
      });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planName, billingCycle } = validation.data;

    const expectedSignature = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await UserModel.findByIdAndUpdate(req.userId, {
      isUpgraded: planName !== "Starter",
      upgradedAt: new Date(),
      currentPlan: planName,
      billingCycle,
    });

    return res.json({
      success: true,
      isUpgraded: planName !== "Starter",
      currentPlan: planName,
      billingCycle,
    });
  } catch (error) {
    console.error("Payment verification failed:", error);
    return res.status(500).json({ message: "Failed to verify payment" });
  }
});

app.use("/api/v1", router);

if (process.env.RUN_WORKER === "true") {
  try {
    await import("./routes/worker.js");
    console.log("Background worker started in web service process");
  } catch (error) {
    console.error("Failed to start background worker in web service process:", error);
  }
}

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
