import express from "express";
import wrapAsync from "../utils/wrapAsync.js";
import expressErrorExtended from "../Utils/ExpressError.js";
import CampGround from "../models/campground.js";
import { joiCampgroundSchema } from "../schemas.js";

const router = express.Router();
// const ObjectID = mongoose.Types.ObjectId; //Deal with Cast to ObjectId failed error: when you pass an id which has invalid ObjectId format to the mongoose database query method like .findById().

const validateCampground = (req, res, next) => {
  const result = joiCampgroundSchema.validate(req.body); //pass data through to schema
  if (result.error) {
    const msg = result.error.details.map((el) => el.message).join(","); // result.error.details = array, have to map over it
    throw new expressErrorExtended(msg, 400);
  } else {
    next();
  }
};

router.get(
  "/",
  wrapAsync(async (req, res) => {
    const campgrounds = await CampGround.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

//this has to be before router.get("/campgrounds/:id" otherwise it will see /new as an id
// create new campgrounds needs to reqs: one for creating new (form) = get, one for posting to /campgrounds
//CREATE
router.get("/new", (req, res) => {
  res.render("campgrounds/new");
});

//UPDATE
router.get(
  "/:id/edit",
  wrapAsync(async (req, res) => {
    const campground = await CampGround.findById(req.params.id);
    if (!campground) {
      req.flash("error", "Cannot find that Campground");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
  })
);

router.post(
  "/",
  validateCampground,
  wrapAsync(async (req, res, next) => {
    const campground = new CampGround(req.body.campground);
    await campground.save();
    req.flash("success", "Successfully made a new Campground");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

//READ
router.get(
  "/:id",
  wrapAsync(async (req, res, next) => {
    const campground = await CampGround.findById(req.params.id).populate("reviews");
    if (!campground) {
      req.flash("error", "Cannot find that Campground");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/details", { campground });
    // ERROR HANDLING B4 wrapAsync
    //async= finding corresponding camp ground in DB
    // const { id } = req.params;
    // if (!ObjectID.isValid(id)) {
    //   return next(new expressErrorExtended("Invalid Id", 400)); //Invalid ObjectId format
    // }
    // if (!campground) {
    //   return next(new expressErrorExtended("Product Not Found", 404)); //Valid id in the ObjectId format but it doesn't exist in the database
    // }
  })
);

router.put(
  "/:id",
  validateCampground,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await CampGround.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    req.flash("success", "Successfully updated Campground");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.delete(
  "/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await CampGround.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted Campground!");
    res.redirect("/campgrounds");
  })
);

export default router;
