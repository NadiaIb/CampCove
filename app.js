import express, { urlencoded } from "express"; // add 'type':'module' to package.json
import path from "path";
import mongoose from "mongoose";
import ejsMate from "ejs-mate";
import expressErrorExtended from "./Utils/ExpressError.js";
import methodOverride from "method-override"; // forms only send get/post req from the browser, we need this for put/patch/delete
import session from "express-session";
import flash from 'connect-flash'

import campgrounds from "./routes/campgrounds.js";
import reviews from "./routes/reviews.js";

main().catch((err) => console.log(err, "connection error"));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/camp-cove"); // yelp-camp = DB name
  console.log("Database connected");
}

const app = express();

const __dirname = path.resolve(); //path.resolve() ensures that __dirname always represents an absolute path, regardless of how the script is executed or where it is located.
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true })); // for POST & PUT : express.urlencoded() is a method inbuilt in express to recognize the incoming Request Object as strings or arrays
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public"))); // serve public directory

//SESSIONS
const sessionConfig = {
  secret: 'secretPassword',
  resave: false,
  saveUninitialized: true,
  cookie:{
    httpOnly:true, 
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //expire after a week
    maxAge: 1000 * 60 * 60 * 24 * 7,
  }
}
app.use(session(sessionConfig))
app.use(flash())

app.use((req,res,next)=>{
  res.locals.success = req.flash('success')
  res.locals.error = req.flash('error')
  next()
})

//ROUTES
app.use("/campgrounds", campgrounds);
app.use("/campgrounds/:id/reviews", reviews);

app.get("/", (req, res) => {
  res.render("home");
});

//ERROR HANDLERS
app.all("*", (req, res, next) => {
  next(new expressErrorExtended("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err; //default err code
  if (!err.message) err.message = "Oh No, Something Went Wrong";
  res.status(statusCode).render("error.ejs", { err });
});

app.listen(3000, () => {
  console.log("Listening on Port 3000");
});
