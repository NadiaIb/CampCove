import express, { urlencoded } from "express"; // add 'type':'module' to package.json
import path from "path";
import mongoose from "mongoose";
import CampGround from "./models/campground.js";
import methodOverride from "method-override"; // forms only send get/post req from the browser, we need this for put/patch/delete
import ejsMate from "ejs-mate";
import wrapAsync from "./utils/wrapAsync.js";
import expressErrorExtended from "./Utils/ExpressError.js";
import joiCampgroundSchema from "./schemas.js";

const ObjectID = mongoose.Types.ObjectId; //Deal with Cast to ObjectId failed error: when you pass an id which has invalid ObjectId format to the mongoose database query method like .findById().

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

const validateCampground = (req, res, next) => {
  const result = joiCampgroundSchema.validate(req.body); //pass data through to schema
  if (result.error) {
    const msg = result.error.details.map((el) => el.message).join(","); // result.error.details = array, have to map over it
    throw new expressErrorExtended(msg, 400);
  } else {
    next();
  }
};

app.get("/", (req, res) => {
  res.render("home");
});

app.get(
  "/campgrounds",
  wrapAsync(async (req, res) => {
    const campgrounds = await CampGround.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

//this has to be before app.get("/campgrounds/:id" otherwise it will see /new as an id
// create new campgrounds needs to reqs: one for creating new (form) = get, one for posting to /campgrounds
//CREATE
app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

app.post(
  "/campgrounds",
  validateCampground,
  wrapAsync(async (req, res, next) => {
    const campground = new CampGround(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

//READ
app.get(
  "/campgrounds/:id",
  wrapAsync(async (req, res, next) => {
    //async= finding corresponding camp ground in DB
    const { id } = req.params;
    if (!ObjectID.isValid(id)) {
      return next(new expressErrorExtended("Invalid Id", 400)); //Invalid ObjectId format
    }
    const campground = await CampGround.findById(req.params.id);
    if (!campground) {
      return next(new expressErrorExtended("Product Not Found", 404)); //Valid id in the ObjectId format but it doesn't exist in the database
    }
    res.render("campgrounds/details", { campground });
  })
);

//UPDATE
app.get(
  "/campgrounds/:id/edit",
  wrapAsync(async (req, res) => {
    const campground = await CampGround.findById(req.params.id);
    res.render("campgrounds/edit", { campground });
  })
);

app.put(
  "/campgrounds/:id",
  validateCampground,wrapAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await CampGround.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

app.delete(
  "/campgrounds/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await CampGround.findByIdAndDelete(id);
    res.redirect("/campgrounds");
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
