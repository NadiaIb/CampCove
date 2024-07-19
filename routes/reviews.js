import express from "express";
import wrapAsync from "../utils/wrapAsync.js";
import expressErrorExtended from "../Utils/ExpressError.js";
import Review from "../models/review.js";
import CampGround from "../models/campground.js";

import { joiReviewSchema } from "../schemas.js";

const router = express.Router({mergeParams: true}); // so we can have access to id on params, (merges params on app.js)

const validateReview = (req, res, next) => {
  const result = joiReviewSchema.validate(req.body);
  if (result.error) {
    const msg = result.error.details.map((el) => el.message).join(","); // result.error.details = array, have to map over it
    throw new expressErrorExtended(msg, 400);
  } else {
    next();
  }
};

router.post(
  "/",
  validateReview,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await CampGround.findById(id);
    const review = new Review(req.body.review);
    campground.reviews.push(review); // push reviews onto reviews property in campground model
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!')
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.delete(
  "/:reviewId",
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    //remove reference id of review from CampGround
    await CampGround.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); //mongo way to delete: takes pulls reviewId from reviews array
    // delete the review
    await Review.findByIdAndDelete(reviewId); //use middleware in models/campgrounds.js
    req.flash('success', 'Successfully deleted review!')
    res.redirect(`/campgrounds/${id}`);
  })
);

export default router;
