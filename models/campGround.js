import mongoose from "mongoose";
const {Schema} = mongoose 

const CampgroundSchema = new Schema({
  title: String,
  image: String,
  price: Number,
  description: String,
  location: String
})

export default mongoose.model('Campground',CampgroundSchema)
// collection in yelp-camp = campgrounds