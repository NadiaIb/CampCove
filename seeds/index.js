// connected to mongoose so we can seed file on its own when we make changes to model or data
import mongoose from "mongoose";
import campGround from "../models/campGround.js";
import cities from "./cities.js";
import { places, descriptors } from "./seedHelpers.js";

main().catch((err) => console.log(err, "connection error"));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/camp-cove"); // yelp-camp = DB name
  console.log("Database connected");
}

const sample = (array) => { //returns random value in array for seedHelpers
  return array[Math.floor(Math.random() * array.length)];
};

// Deletes all data before adding new data
const seedDB = async () => {
  await campGround.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000); // random num used to index cities array
    const camp = new campGround({
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`, // calling sample function and passing descriptors/places array to pick out random values from both arrays,
    });
    await camp.save();
  }
};

seedDB().then(()=>{
  mongoose.connection.close()
})
