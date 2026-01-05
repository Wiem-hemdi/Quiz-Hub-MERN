const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    isTeacher: { type: Boolean, default: false },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

// Méthode pour comparer les mots de passe
userSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error("Error in matchPassword:", error);
    return false;
  }
};

// CORRECTION ICI : Le hook pre-save avait une erreur
userSchema.pre("save", async function (next) {
  // CORRIGÉ : Vérifie si le champ password a été modifié
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Ajoutez aussi un hook pour la mise à jour
userSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update.password) {
    try {
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(update.password, salt);
      this.setUpdate(update);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;