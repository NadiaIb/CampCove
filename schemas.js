import Joi from "joi";//server side validation, define a schema for some data (req.body must have specified values)

const joiCampgroundSchema = Joi.object({
  campground: Joi.object({
    // campground = object with keys on it - campground:{title:'random', price:'23'...}
    title: Joi.string().required(),
    price: Joi.number().required().min(0),
    image: Joi.string().required(),
    location: Joi.string().required(),
    description: Joi.string().required(),
  }).required(),
});
export default joiCampgroundSchema;