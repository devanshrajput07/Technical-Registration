import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import session from 'express-session'
import cors from 'cors'
import connectDB from './config/connectDb.js'
// import Routes from './Route.js'

const app = express()
const port = process.env.PORT
const DATABASE_URL = process.env.DATABASE_URL

app.set("view engine", "ejs");

app.get("/login",(req,res)=>{
  res.render("auth/login.ejs")
})

//Cors Policy
app.use(cors())

// Database Connection
connectDB(DATABASE_URL)

// JSON
app.use(express.json())

// Load Routes
// app.use("/api/user", Routes)

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})