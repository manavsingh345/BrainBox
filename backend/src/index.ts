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


mongoose.connect(process.env.MONGO_URL!).then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error(" MongoDB connection error:", err);
  });

app.use(cors({
  origin: 'http://localhost:5173',  // Allow Vite frontend
  credentials: true  // Optional: if you send cookies or headers
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
    let errorThrown=false;
    const hashedPassword=await bcrypt.hash(password,5);
    
    const newUser=await UserModel.create({
        username:username,
        email:email,
        password:hashedPassword,
        isUpgraded: false,
    });
    res.json({
      message: "User is signed up",
      username: newUser.username,
      email: newUser.email
    });
  }catch(e){
    res.status(411).json({
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
      //@ts-ignore
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
    //@ts-ignore  
    const userId=req.userId;
    const content=await ContentModel.find({
        userId:userId
    }).populate("userId","username")              //to get the whole or what you need info of the user populate used
    res.json({
      content
    })

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
      //@ts-ignore
      userId:req.userId
     }
     )
     if(existingLink){
        res.json({
        hash:existingLink.hash
      })
     }
      const hash=random(10);
      await LinkModel.create({
        //@ts-ignore
        userId:req.userId,
        hash:hash
      })
       res.json({
        message:"/share/"+ hash
    })
  
    
  }else{
       await  LinkModel.deleteOne({
          //@ts-ignore
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
    res.status(411).json({
      message:"Sorry incorrect input"
    });
    return;
  }
  const content=await ContentModel.findOne({
      userId:link.userId
  });
  const user=await UserModel.findOne({
    _id:link.userId
  });

   if(!user) {
    res.status(411).json({
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
    
    try{
      const assiantReply= await generateOpenAiResponse(message);
      console.log(assiantReply);
      res.json({reply:assiantReply});
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

app.post("/api/v1/payments/razorpay/verify", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!razorpayKeySecret) {
      return res.status(500).json({ message: "Razorpay secret is not configured" });
    }

    const schema = z.object({
      razorpay_order_id: z.string().min(1),
      razorpay_payment_id: z.string().min(1),
      razorpay_signature: z.string().min(1),
      planName: z.string().optional(),
      billingCycle: z.enum(["monthly", "yearly"]).optional(),
    });

    const validation = schema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: "Invalid payment verification payload",
        errors: validation.error,
      });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = validation.data;

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
      isUpgraded: true,
      upgradedAt: new Date(),
    });

    return res.json({
      success: true,
      isUpgraded: true,
    });
  } catch (error) {
    console.error("Payment verification failed:", error);
    return res.status(500).json({ message: "Failed to verify payment" });
  }
});

app.use("/api/v1", router);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
