const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/camground');


mongoose.connect('mongodb://localhost:27017/yelpcamp', {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true, // --> False by default. Set to true to make Mongoose's default index build use createIndex() instead of ensureIndex() to avoid deprecation warnings from the MongoDB driver.
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
  console.log("Database Connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 30) + 2;
    const newCamp = new Campground({
      title: `${sample(descriptors)} ${sample(places)}`,
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      image: 'https://source.unsplash.com/collection/190727',
      description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Autem praesentium quod commodi vero dicta rem, voluptatum recusandae veritatis! Molestiae a sit perspiciatis dolorem labore beatae quam, laudantium quis libero excepturi.',
      price
    });
    await newCamp.save();
  }
}

seedDB().then(() => {
  mongoose.connection.close();
});