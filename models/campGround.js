import mongoose from "mongoose";
const {Schema} = mongoose 

const CampgroundSchema = new Schema({
  title: String,
  price: String,
  description: String,
  location: String
})

export default mongoose.model('Campground',CampgroundSchema)
// collection in yelp-camp = campgrounds