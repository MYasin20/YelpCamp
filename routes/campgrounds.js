const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/camground');
const { campgroundSchema } = require('../schemas');

const validatedCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body)
  if (error) {
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
}

// INDEX ROUTE
router.get('/', catchAsync(async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds });
}));

// NEW ROUTE
router.get('/new', (req, res) => {
  res.render('campgrounds/new');
});

// Create POST ROUTE
router.post('/', validatedCampground, catchAsync(async (req, res, next) => {
  const campground = new Campground(req.body.campground);
  await campground.save();
  req.flash('success', 'Successful!!');
  res.redirect(`/campgrounds/${campground._id}`);
}));

// SHOW ROUTE
router.get('/:id', catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id).populate('reviews');
  if(!campground) {
    req.flash('error', 'Cannot find that campground');
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/show', { campground })
}));

// EDIT ROUTE
router.get('/:id/edit', catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if(!campground) {
    req.flash('error', 'Cannot find that campground');
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/edit', { campground });
}));

// EDIT PATCH ROUTE
router.patch('/:id', validatedCampground, catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, req.body.campground);
  req.flash('success', 'Successfully Updated Campground')
  res.redirect(`/campgrounds/${campground._id}`);
}));

// DELETE ROUTE
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id, req.body.campground);
  req.flash('success', 'Successfully deleted campground');
  res.redirect('/campgrounds');
});


module.exports = router;