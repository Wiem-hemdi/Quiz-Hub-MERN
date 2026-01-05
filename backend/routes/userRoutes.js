const express = require("express");
const router = express.Router();
const {
  registerUser,
  authUser,
  getUsers,
  getUserById,
  deleteUser,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware"); // your auth middleware

router.route("/").post(registerUser);

router.route("/login").post(authUser);

router.route("/all").get(protect, getUsers);

router.route("/:id").get(protect, getUserById);

router.route("/:id").delete(protect, deleteUser);


module.exports = router;
