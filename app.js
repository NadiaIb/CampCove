import express, { urlencoded } from "express"; // add 'type':'module' to package.json
import path from "path";
import mongoose from "mongoose";
import CampGround from "./models/campground.js";

main().catch((err) => console.log(err, "connection error"));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/camp-cove"); // yelp-camp = DB name
  console.log("Database connected");
}

const app = express();

const __dirname = path.resolve(); //path.resolve() ensures that __dirname always represents an absolute path, regardless of how the script is executed or where it is located.
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/campgrounds", async (req, res) => {
  const campgrounds = await CampGround.find({});
  res.render("campgrounds/index", { campgrounds });
});

//this has to be before app.get("/campgrounds/:id" otherwise it will see /new as an id
// create new campgrounds needs to reqs: one for creating new (form) = get, one for posting to /campgrounds
app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

app.post("/campgrounds", async (req, res) => {
  const campground = new CampGround(req.body.campground);
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`);
});

app.get("/campgrounds/:id", async (req, res) => {
  //async= finding corresponding camp ground in DB
  const { id } = req.params;
  const campground = await CampGround.findById(req.params.id);
  res.render("campgrounds/details", { campground });
});

app.listen(3000, () => {
  console.log("Listening on Port 3000");
});
