import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import cors from "cors";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import connectDB from "./config/connectDb.js";
import TeamModel from "./model/user.js";
import Razorpay from "razorpay";
import bodyParser from "body-parser";
import sendEmail from "./config/emailConfig.js";
import Payment from "./model/payment.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;
app.set("view engine", "ejs");

app.use(cors());

// Database Connection
connectDB(DATABASE_URL);

// JSON
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    function (accessToken, refreshToken, profile, cb) {
      cb(null, profile);
    }
  )
);

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, "public")));

app.get("/login", (req, res) => {
  res.render(path.join(__dirname, "views/login.ejs"));
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("/register");
  }
);

app.get("/logout", (req, res) => {
  req.logout();
  req.session.destroy((err) => {
    if (err) {
      console.error("Error while destroying session:", err);
    }
    res.redirect("/login");
  });
});

app.get("/register", async (req, res) => {
  try {
    if (req.isAuthenticated() && req.user && req.user.displayName) {
      const existingUser = await TeamModel.findOne({
        leader_email: req.user.emails[0].value,
      });
      if (existingUser) {
        return res.render(path.join(__dirname, "views/alreadyRegistered.ejs"), {
          user: req.user,
        });
      }
      return res.render(path.join(__dirname, "views/register.ejs"), {
        user: req.user,
      });
    }
    res.redirect("/login");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/registerteam", async (req, res) => {
  const {
    teamleaderRole,
    teamMember2Name,
    teamMember2Email,
    teamMember2Role,
    teamMember3Name,
    teamMember3Email,
    teamMember3Role,
    teamMember4Name,
    teamMember4Email,
    teamMember4Role,
    paymentAmount,
  } = req.body;
  console.log(teamMember2Email, teamMember3Email, teamMember4Email);

  try {
    const doc = new TeamModel({
      leader_name: req.user.displayName,
      leader_email: req.user.emails[0].value,
      profile_photo_url: req.user.photos[0].value,
      leader_role: teamleaderRole,
      team_member_2: {
        name: teamMember2Name,
        email: teamMember2Email,
        role: teamMember2Role,
      },
      team_member_3: {
        name: teamMember3Name,
        email: teamMember3Email,
        role: teamMember3Role,
      },
      team_member_4: {
        name: teamMember4Name,
        email: teamMember4Email,
        role: teamMember4Role,
      },
      payment_amount: paymentAmount,
    });
    await doc.save();
    const saved_user = await TeamModel.findOne({
      leader_email: req.user.emails[0].value,
    });
    if (!saved_user) {
      res.status(500).json({ error: "You are not registered" });
    } else {
      res.render(path.join(__dirname, "views/payment.ejs"), {
        paymentAmount: paymentAmount,
        user: req.user,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/payment", async (req, res) => {
  if (req.isAuthenticated()) {
    let amount = req.body.paymentAmount * 100;
    const razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    try {
      let order = await razorpayInstance.orders.create({
        amount: amount,
        currency: "INR",
        receipt: "receipt#1",
      });
      res.render(path.join(__dirname, "views/paymentdone.ejs"), {
        order,
        amount,
        user: req.user,
      });
      sendEmail({
        email: req.user.emails[0].value,
        subject: "Payment verification",
        message: "Your transaction was successful.",
      });
      console.log("Email sent: Payment successful.");
      return res.status(201).json({
        success: true,
        order,
        amount,
      });
    } catch (error) {
      console.error(error);
      return res.render(path.join(__dirname, "views/payment.ejs"), {
        alert: "Payment failed",
        user: req.user,
      });
    }
  } else {
    return res.status(401).json({ error: "User not authenticated" });
  }
});

app.post("/paymentdone", async (req, res) => {
  const { paymentId, orderId, signature } = req.body;
  const payment = new Payment({
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
    user: req.user._id,
  });
  try {
    await payment.save();
    return res.render(path.join(__dirname, "views/paymentdone.ejs"), {
      paymentId: paymentId,
    });
  } catch (error) {
    console.error(error);
    return res.render(path.join(__dirname, "views/payment.ejs"), {
      alert: "Payment failed",
      user: req.user,
    });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
