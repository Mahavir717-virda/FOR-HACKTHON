const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Activity = require('../models/Activity');

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB file size limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single('avatar');

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

// @route   PUT /api/profile/avatar
// @desc    Update user avatar
// @access  Private
router.put('/avatar', protect, (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }
    if (req.file == undefined) {
      return res.status(400).json({ message: 'Error: No File Selected!' });
    }

    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // The path should be accessible from the frontend
      const avatarPath = `/uploads/${req.file.filename}`;
      user.avatar = avatarPath;
      await user.save();

      res.json({
        message: 'Avatar updated successfully',
        avatar: avatarPath,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  });
});

// @route   GET api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    // req.user is attached by the protect middleware
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/profile/me
// @desc    Update user profile
// @access  Private
router.put('/me', protect, async (req, res) => {
  const { firstName, lastName, email, phoneNumber, gender } = req.body;

  // Build profile object
  const profileFields = {};
  if (firstName) profileFields.firstName = firstName;
  if (lastName) profileFields.lastName = lastName;
  if (email) profileFields.email = email;
  if (phoneNumber) profileFields.phoneNumber = phoneNumber;
  if (gender) profileFields.gender = gender;

  try {
    let user = await User.findById(req.user.id);

    if (user) {
      // Log profile update activity
      const updateActivity = new Activity({
          user: user._id,
          activityType: 'profile_update',
          description: 'User updated their profile.',
      });
      await updateActivity.save();

      // Update
      user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: profileFields },
        { new: true }
      ).select('-password');

      return res.json(user);
    }

    res.status(404).json({ message: 'User not found' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/profile/activity
// @desc    Get user activity
// @access  Private
router.get('/activity', protect, async (req, res) => {
    try {
        const activities = await Activity.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(activities);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;