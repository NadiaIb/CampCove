import express from "express"; // add 'type':'module' to package.json
import path from "path";
import mongoose from "mongoose";
import campground from "./models/campground.js";

main().catch((err) => console.log(err, "connection error"));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/camp-cove"); // yelp-camp = DB name
  console.log("Database connected");
}
const app = express();

const __dirname = path.resolve(); //path.resolve() ensures that __dirname always represents an absolute path, regardless of how the script is executed or where it is located.
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/campgrounds", async (req, res) => {
  const campgrounds = await campground.find({});
  res.render("campgrounds/index", { campgrounds });
});

app.listen(3000, () => {
  console.log("Listening on Port 3000");
});
