import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import ejs from 'ejs';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import connectDB from './config/connectDb.js'
import TeamModel from './user.js';
import Razorpay from 'razorpay'

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
app.use(express.json());

app.use(
  session({
    secret: 'key',
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
app.use(express.static(path.join(__dirname, 'public')));

app.get("/login", (req, res) => {
  res.render(path.join(__dirname, "login.ejs"));
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
  req.logout(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/login");
    }
  });
});

app.get("/register", (req, res) => {
  if (req.isAuthenticated()) {
    res.render(path.join(__dirname, "register.ejs"), { user: req.user });
  } else {
    res.redirect("/login");
  }
});

app.post('/registerteam', async (req, res) => {
  const { leader_name, leader_email, profile_photo_url } = req.user;
  const { team_member_2, team_member_3, team_member_4, payment_amount } = req.body;
  if (
    team_member_2.name &&
    team_member_2.email &&
    team_member_2.role &&
    team_member_3.name &&
    team_member_3.email &&
    team_member_3.role &&
    team_member_4.name &&
    team_member_4.email &&
    team_member_4.role &&
    payment_amount
  ) {
    try {
      const doc = new TeamModel({
        leader_name: leader_name,
        leader_email: leader_email,
        profile_photo_url: profile_photo_url,
        team_member_2: {
          name: team_member_2.name,
          email: team_member_2.email,
          role: team_member_2.role,
        },
        team_member_3: {
          name: team_member_3.name,
          email: team_member_3.email,
          role: team_member_3.role,
        },
        team_member_4: {
          name: team_member_4.name,
          email: team_member_4.email,
          role: team_member_4.role,
        },
        payment_amount: payment_amount,
      });
      await doc.save();
      const saved_user = await TeamModel.findOne({ email: leader_email });
      res.status(200).json({ message: 'User registered successfully', user: saved_user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(400).json({ error: 'Invalid Request' });
  }
});

app.post('/payment', async (req, res) => {
  let amount = req.body.payment_amount * 100;
  const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET 
  });
  try {
    let order = await razorpayInstance.orders.create({
      amount: amount,
      currency: 'INR',
      receipt: "receipt#1"
    });
    res.status(201).json({
      success: true,
      order,
      amount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
