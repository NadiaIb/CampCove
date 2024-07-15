import mongoose from "mongoose";
import Review from './review.js'
const {Schema} = mongoose 

const CampgroundSchema = new Schema({
  title: String,
  image: String,
  price: Number,
  description: String,
  location: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review'
    }
  ]
})

// Campground only contains reviewid REFERENCE so we need to use Mongoose middleware (post) to execute after findOneAndDelete operation on Campground is complete
CampgroundSchema.post('findOneAndDelete', async function(doc){
  if(doc){
    await Review.deleteMany({
      _id:{
        $in: doc.reviews
      }
    })
  }
})

export default mongoose.model('Campground',CampgroundSchema)
// collection in camp-camp = campgrounds