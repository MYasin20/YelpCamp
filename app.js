const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');

const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

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

const app = express();

app.engine('ejs', ejsMate); // boilerplate for using ejs (YelpCampv1 or v2)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));



app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews)

app.get('/', (req, res) => {
  res.render('home');
});


// MIDDLEWARE

app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
  const { status = 500 } = err;
  if (!err.message) err.message = 'Something went wrong!';
  res.status(status).render('error', { err });
});

app.listen(3000, () => {
  console.log('Server is running on PORT 3000');
});