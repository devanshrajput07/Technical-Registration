const passport = require('passport');
const GoogleStrategy = require( 'passport-google-oauth20').Strategy;
import ejs from 'ejs'
import path from 'path'

app.use(
  session({
    secret: process.env.SESSIONSECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID:     GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8000/auth/google/callback",
  },
  function(accessToken, refreshToken, profile, cb) {
    cb(null, profile);
  }
));

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname/auth, "public")));

app.get("/login", (req, res) => {
  res.render(path.join(__dirname/auth, "auth/login.ejs"));
});