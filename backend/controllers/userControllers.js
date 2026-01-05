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
// Dans userControllers.js
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

    // Chercher l'utilisateur
    const user = await User.findOne({ email });
    console.log("User found:", user ? "Yes" : "No");
    
    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }

    // Vérifier le mot de passe
    console.log("Checking password...");
    const isPasswordValid = await user.matchPassword(password);
    console.log("Password valid:", isPasswordValid);
    
    if (isPasswordValid) {
      // Générer le token
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
// Get all users
// Get all users (with pagination and filtering)
const getUsers = expressAsyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Filtres optionnels
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
    
    // Récupérer les utilisateurs 
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Compter le total pour la pagination
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


module.exports = { 
  registerUser, 
  authUser, 
  getUsers, 
  getUserById, 
  deleteUser 
};
