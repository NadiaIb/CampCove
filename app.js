import express, { urlencoded } from "express"; // add 'type':'module' to package.json
import path from "path";
import mongoose from "mongoose";
import CampGround from "./models/campground.js";
import methodOverride from "method-override"; // forms only send get/post req from the browser, we need this for put/patch/delete
import ejsMate from "ejs-mate";
import wrapAsync from "./utils/wrapAsync.js";
import expressErrorExtended from "./Utils/ExpressError.js";
import {joiReviewSchema } from "./schemas.js";
import Review from "./models/review.js";

import campgrounds from './routes/campgrounds.js'

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


const validateReview = (req, res, next) => {
  const result = joiReviewSchema.validate(req.body);
  if (result.error) {
    const msg = result.error.details.map((el) => el.message).join(","); // result.error.details = array, have to map over it
    throw new expressErrorExtended(msg, 400);
  } else {
    next();
  }
};

app.use('/campgrounds', campgrounds)

app.get("/", (req, res) => {
  res.render("home");
});



app.post(
  "/campgrounds/:id/reviews",
  validateReview,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await CampGround.findById(id);
    const review = new Review(req.body.review);
    campground.reviews.push(review); // push reviews onto reviews property in campground model
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

app.delete(
  "/campgrounds/:id/reviews/:reviewId",wrapAsync(async(req, res) => {
    const {id, reviewId} = req.params;
    //remove reference id of review from CampGround
    await CampGround.findByIdAndUpdate(id,{$pull:{reviews:reviewId}}) //mongo way to delete: takes pulls reviewId from reviews array
    // delete the review
    await Review.findByIdAndDelete(reviewId) //use middleware in models/campgrounds.js 
    res.redirect(`/campgrounds/${id}`)

  })
);

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
