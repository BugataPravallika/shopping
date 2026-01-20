import asyncHandler from '../middleware/asyncHandler.js';
import generateToken from '../utils/generateToken.js';
import User from '../models/userModel.js';

// @desc    Auth user & get token
// @route   POST /api/users/auth
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    generateToken(res, user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = (req, res) => {
  res.clearCookie('jwt');
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      savedAddresses: user.savedAddresses,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.isAdmin) {
      res.status(400);
      throw new Error('Can not delete admin user');
    }
    await User.deleteOne({ _id: user._id });
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});
// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.isAdmin = Boolean(req.body.isAdmin);

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get saved addresses
// @route   GET /api/users/addresses
// @access  Private
const getSavedAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json(user.savedAddresses);
});

// @desc    Add saved address
// @route   POST /api/users/addresses
// @access  Private
const addSavedAddress = asyncHandler(async (req, res) => {
  const { name, address, city, postalCode, country, isDefault } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // If this is set as default, unset all other defaults
  if (isDefault) {
    user.savedAddresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  user.savedAddresses.push({
    name,
    address,
    city,
    postalCode,
    country,
    isDefault: isDefault || false,
  });

  await user.save();

  res.status(201).json(user.savedAddresses);
});

// @desc    Update saved address
// @route   PUT /api/users/addresses/:addressId
// @access  Private
const updateSavedAddress = asyncHandler(async (req, res) => {
  const { name, address, city, postalCode, country, isDefault } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const addressIndex = user.savedAddresses.findIndex(
    (addr) => addr._id.toString() === req.params.addressId
  );

  if (addressIndex === -1) {
    res.status(404);
    throw new Error('Address not found');
  }

  // If this is set as default, unset all other defaults
  if (isDefault) {
    user.savedAddresses.forEach((addr, index) => {
      if (index !== addressIndex) {
        addr.isDefault = false;
      }
    });
  }

  // Update the address
  if (name) user.savedAddresses[addressIndex].name = name;
  if (address) user.savedAddresses[addressIndex].address = address;
  if (city) user.savedAddresses[addressIndex].city = city;
  if (postalCode) user.savedAddresses[addressIndex].postalCode = postalCode;
  if (country) user.savedAddresses[addressIndex].country = country;
  if (isDefault !== undefined)
    user.savedAddresses[addressIndex].isDefault = isDefault;

  await user.save();

  res.json(user.savedAddresses);
});

// @desc    Delete saved address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
const deleteSavedAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.savedAddresses = user.savedAddresses.filter(
    (addr) => addr._id.toString() !== req.params.addressId
  );

  await user.save();

  res.json(user.savedAddresses);
});

export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  getSavedAddresses,
  addSavedAddress,
  updateSavedAddress,
  deleteSavedAddress,
};
