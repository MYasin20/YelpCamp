const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn } = require('../middleware');
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/camground');
const Review = require('../models/review');


router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  const review = new Review(req.body.review);
  review.author = req.user._id;
  campground.reviews.push(review)
  await review.save();
  await campground.save();
  req.flash('success', 'Created new Review');
  res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:reviewId', catchAsync(async (req, res) => {
  const { id, reviewId } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  req.flash('success', 'Successfully deleted review')
  res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;