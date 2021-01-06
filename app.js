const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const { campgroundSchema, reviewSchema } = require('./schemas');
const Campground = require('./models/camground');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');
const Review = require('./models/review');

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

const validatedCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body)
  if (error) {
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
}

const validateReview = (req, res, next) => {
  console.log(reviewSchema);
  const { error } = reviewSchema.validate(req.body);
  console.log(error);
  if (error) {
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
}

app.get('/', (req, res) => {
  res.render('home');
});

// INDEX ROUTE
app.get('/campgrounds', catchAsync(async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds });
}));

// NEW ROUTE
app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new');
});

// Create POST ROUTE
app.post('/campgrounds', validatedCampground, catchAsync(async (req, res, next) => {
  const campground = new Campground(req.body.campground);
  await campground.save()
  res.redirect(`/campgrounds/${campground._id}`);
}));

// SHOW ROUTE
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id).populate('reviews');
  res.render('campgrounds/show', { campground })
}));

// EDIT ROUTE
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  res.render('campgrounds/edit', { campground });
}));

// EDIT PATCH ROUTE
app.patch('/campgrounds/:id', validatedCampground, catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, req.body.campground);
  res.redirect(`/campgrounds/${campground._id}`);
}));

// DELETE ROUTE
app.delete('/campgrounds/:id', async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id, req.body.campground);
  res.redirect('/campgrounds');
});

app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  const review = new Review(req.body.review);
  campground.reviews.push(review)
  await review.save();
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
  const { id, reviewId } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  console.log(campground);
  res.redirect(`/campgrounds/${id}`);
}));

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