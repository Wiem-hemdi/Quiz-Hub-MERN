const expressAsyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");

// Register a new user
const registerUser = expressAsyncHandler(async (req, res) => {
  const { name, email, password, isTeacher } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please enter all the fields");
  }

  const userExist = await User.findOne({ email });
  if (userExist) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    isTeacher: isTeacher || false,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isTeacher: user.isTeacher,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Failed to create the user");
  }
});

// Authenticate user & get token
const authUser = expressAsyncHandler(async (req, res) => {
  try {
    console.log("🔑 Login attempt:", req.body.email);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log("❌ Missing credentials");
      return res.status(400).json({
        success: false,
        error: "Please provide email and password"
      });
    }

    const user = await User.findOne({ email });
    console.log("User found:", user ? "Yes" : "No");
    
    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }

    const isPasswordValid = await user.matchPassword(password);
    console.log("Password valid:", isPasswordValid);
    
    if (isPasswordValid) {
      const token = generateToken(user._id);
      console.log("✅ Login successful for:", email);
      
      res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        isTeacher: user.isTeacher || false,
        token: token
      });
    } else {
      console.log("❌ Invalid password for:", email);
      res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }
    
  } catch (error) {
    console.error("🔥 ERROR in authUser:", error);
    console.error("Stack trace:", error.stack);
    
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get all users (with pagination and filtering)
const getUsers = expressAsyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const filter = {};
    if (req.query.isTeacher) {
      filter.isTeacher = req.query.isTeacher === 'true';
    }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await User.countDocuments(filter);
    
    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
    console.log(`[${new Date().toISOString()}] Found ${users.length} users (page ${page})`);
    
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching users"
    });
  }
});

// Get a single user by ID
const getUserById = expressAsyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// Update a user by ID
const updateUser = expressAsyncHandler(async (req, res) => {
  try {
    const { name, email, isTeacher, profileImage, currentPassword, newPassword } = req.body;
    const userId = req.params.id;

    console.log("📥 Update request for user:", userId);

    const user = await User.findById(userId).select("+password");
    if (!user) {
      console.log("❌ User not found:", userId);
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    if (req.user._id.toString() !== userId) {
      console.log("❌ Not authorized:", req.user._id, "trying to update", userId);
      return res.status(403).json({
        success: false,
        error: "Not authorized to update this profile"
      });
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        console.log("❌ Email already exists:", email);
        return res.status(400).json({
          success: false,
          error: "Email already in use"
        });
      }
    }

    if (newPassword) {
      console.log("🔑 Password update requested");
      if (!currentPassword) {
        console.log("❌ Current password missing");
        return res.status(400).json({
          success: false,
          error: "Current password is required to set a new password"
        });
      }
      
      const isPasswordValid = await user.matchPassword(currentPassword);
      if (!isPasswordValid) {
        console.log("❌ Current password incorrect");
        return res.status(401).json({
          success: false,
          error: "Current password is incorrect"
        });
      }
      
      console.log("✅ Password validated, updating...");
      user.password = newPassword;
    }

    if (name !== undefined) {
      console.log("🔄 Updating name:", user.name, "→", name);
      user.name = name;
    }
    if (email !== undefined) {
      console.log("🔄 Updating email:", user.email, "→", email);
      user.email = email;
    }
    if (isTeacher !== undefined) {
      console.log("🔄 Updating isTeacher:", user.isTeacher, "→", isTeacher);
      user.isTeacher = isTeacher;
    }
    if (profileImage !== undefined) {
      console.log("🔄 Updating profile image");
      user.profileImage = profileImage;
    }

    await user.save();
    console.log("💾 User saved successfully");

    const updatedUser = await User.findById(userId).select("-password");

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });

    console.log(`[${new Date().toISOString()}] User ${userId} updated profile`);
    
  } catch (error) {
    console.error("❌ Error updating user:", error);
    res.status(500).json({
      success: false,
      error: "Server error while updating user"
    });
  }
});

// Delete a user by ID
const deleteUser = expressAsyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    await user.remove();
    res.json({ message: "User removed" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// EXPORTS - CORRECT
module.exports = { 
  registerUser, 
  authUser, 
  getUsers, 
  getUserById, 
  updateUser, 
  deleteUser 
};