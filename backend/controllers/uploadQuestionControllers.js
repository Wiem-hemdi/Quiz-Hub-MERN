const expressAsyncHandler = require("express-async-handler");
const Question = require("../models/questionModel");
const fs = require("fs");
const path = require("path");

// Upload Question - Gère à la fois form-data ET JSON
const uploadQuestion = expressAsyncHandler(async (req, res) => {
  const { lang_id, category, desc, option1, option2, option3, option4, correct_answer, image_url } = req.body;

  console.log("=== REQUEST BODY ===");
  console.log("lang_id:", lang_id);
  console.log("category:", category);
  console.log("desc:", desc);
  console.log("option1:", option1);
  console.log("option2:", option2);
  console.log("option3:", option3);
  console.log("option4:", option4);
  console.log("correct_answer:", correct_answer);
  console.log("image_url:", image_url);
  console.log("req.file:", req.file ? "Fichier image présent" : "Pas de fichier");
  console.log("====================");

  // Vérifier que l'utilisateur est un teacher
  const user = req.user;
  if (!user.isTeacher) {
    console.log("❌ User is not a teacher");
    return res.status(403).json({ success: false, message: "You are not a teacher" });
  }

  // Validation des champs
  if (!lang_id || !category || !desc || !option1 || !option2 || !option3 || !option4 || correct_answer === undefined || correct_answer === "") {
    console.log("❌ Validation failed!");
    return res.status(400).json({ success: false, message: "Fill all fields" });
  }

  // Gestion de l'image
  let imageUrl = null;
  
  // Si un fichier est uploadé (form-data)
  if (req.file) {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
      console.log("✅ Upload directory created");
    }

    const fileName = Date.now() + "-" + req.file.originalname;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, req.file.buffer);
    imageUrl = `/uploads/${fileName}`;
    console.log("✅ Image saved from file:", imageUrl);
  } 
  // Sinon si une URL est fournie (JSON)
  else if (image_url) {
    imageUrl = image_url;
    console.log("✅ Image URL provided:", imageUrl);
  }

  // Créer tableau options
  const optionsArr = [option1, option2, option3, option4].map(opt => opt.trim());

  // Convertir correct_answer en nombre
  const correctAnswerNum = parseInt(correct_answer);
  if (isNaN(correctAnswerNum) || correctAnswerNum < 0 || correctAnswerNum > 3) {
    console.log("❌ Invalid correct answer:", correct_answer);
    return res.status(400).json({ success: false, message: "Invalid correct answer" });
  }

  // Créer la question
  const newQuestion = {
    user: user._id,
    language_id: lang_id.toLowerCase(),
    category,
    desc,
    options: optionsArr,
    correct_answer: correctAnswerNum,
    image: imageUrl,
  };

  console.log("Creating question with data:", newQuestion);

  try {
    const created = await Question.create(newQuestion);
    console.log("✅ Question created successfully!", created._id);
    res.status(201).json({ success: true, message: "Question added", question: created });
  } catch (error) {
    console.log("❌ Error creating question:", error.message);
    throw error;
  }
});

module.exports = uploadQuestion;