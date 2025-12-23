import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box, Text, VStack, Radio, RadioGroup, Button, Container,
  Select, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalFooter, ModalCloseButton, useDisclosure, Center, Badge,
  Progress, Image, ScaleFade
} from "@chakra-ui/react";
import axios from "axios";
import Navbar from "./navbar";
import Confetti from "react-confetti";
import { Howl } from "howler";

import levelUpSound from "./sound/levelup.wav";
import correctSoundFile from "./sound/correct.wav";
import incorrectSoundFile from "./sound/incorrect.mp3";
import countdownSoundFile from "./sound/countdown1.wav";

const TestPage = () => {
  const [questions, setQuestions] = useState([]);
  const [category, setCategory] = useState("");
  const [langId, setLangId] = useState("");
  const [languages, setLanguages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(-1);
  const [showAnswer, setShowAnswer] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [userStats, setUserStats] = useState({ xp: 0, streak: 0, badges: [] });
  const [showConfetti, setShowConfetti] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const [earnedBadge, setEarnedBadge] = useState("");
  const [timeLeft, setTimeLeft] = useState(20);
  const [questionResults, setQuestionResults] = useState([]); // Stocke les résultats de chaque question
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const levelUp = new Howl({ src: [levelUpSound] });
  const correctSound = new Howl({ src: [correctSoundFile] });
  const incorrectSound = new Howl({ src: [incorrectSoundFile] });
  const countdownSound = new Howl({ src: [countdownSoundFile] });

  // Calcul du score à partir des résultats
  const correctCount = questionResults.filter(result => result.isCorrect).length;
  const totalQuestions = questions.length;

  const fetchLanguages = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const res = await axios.get("http://localhost:5000/quiz/languages", config);
      setLanguages(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [userInfo.token]);

  const getQuestions = useCallback(async (languageId, category) => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const res = await axios.post(
        "http://localhost:5000/quiz/questions",
        { language_id: languageId, category },
        config
      );
      if (languageId && category) {
        setQuestions(res.data);
        setQuestionResults([]); // Réinitialiser les résultats
        setCurrentIndex(0);
        setSelectedOption(-1);
        setShowAnswer(false);
        setTimeLeft(20);
      }
    } catch (err) {
      console.error(err);
    }
  }, [userInfo.token]);

  useEffect(() => { fetchLanguages(); }, [fetchLanguages]);

  useEffect(() => {
    if (langId && category) {
      getQuestions(langId, category);
    }
  }, [langId, category, getQuestions]);

  useEffect(() => {
    if (!questions[currentIndex] || showAnswer || currentIndex >= questions.length) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleNext();
          return 20;
        }
        if (prev <= 5) countdownSound.play();
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, showAnswer, questions]);
  
  const handleNext = async () => {
  console.log("=== DEBUG HANDLE NEXT ===");
  console.log("Current question index:", currentIndex);
  console.log("Selected option:", selectedOption);
  console.log("Question ID:", questions[currentIndex]?._id);
  
  const question = questions[currentIndex];
  const dataToSend = {
    uid: userInfo._id,
    pairs: [{ 
      objectId: question._id, 
      givenAnswer: selectedOption === -1 ? -1 : Number(selectedOption) // -1 pour timeout
    }],
  };
  
  console.log("Data being sent to backend:", JSON.stringify(dataToSend, null, 2));

  try {
    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
    console.log("Sending request to backend...");
    
    const res = await axios.post("http://localhost:5000/quiz/answers", dataToSend, config);
    
    console.log("=== BACKEND RESPONSE ===");
    console.log("Full response:", res.data);
    console.log("Pairs from response:", res.data.pairs);
    console.log("Report from response:", res.data.report);
    
    if (res.data && res.data.pairs?.length) {
      const pair = res.data.pairs[0];
      console.log("First pair details:", pair);
      console.log("isCorrect value:", pair.isCorrect);
      console.log("Type of isCorrect:", typeof pair.isCorrect);
      
      const isCorrect = pair.isCorrect;
      const correctAnswerText = pair.correctAnswerText || "N/A";

      console.log("Updating questionResults with isCorrect:", isCorrect);
      
      // Ajouter au tableau des résultats
      setQuestionResults(prev => {
        const newResults = [...prev, {
          questionId: question._id,
          isCorrect,
          selectedOption
        }];
        console.log("New questionResults:", newResults);
        console.log("Correct count:", newResults.filter(r => r.isCorrect).length);
        return newResults;
      });

      setFeedback(
        selectedOption === -1
          ? "⏱️ Time's up!"
          : isCorrect
            ? "✅ Correct!"
            : `❌ Wrong! Correct answer: "${correctAnswerText}"`
      );

      // Jouer le son approprié
      if (isCorrect) {
        console.log("Playing correct sound");
        correctSound.stop(); 
        correctSound.play();
      } else {
        console.log("Playing incorrect sound");
        incorrectSound.stop(); 
        incorrectSound.play();
      }
    }

    // Ajouter userStats si le backend les retourne
    if (res.data.userStats) {
      console.log("User stats from backend:", res.data.userStats);
      const oldBadges = userStats.badges.length;
      setUserStats(res.data.userStats);
      if (res.data.userStats.badges.length > oldBadges) {
        const newBadge = res.data.userStats.badges[res.data.userStats.badges.length - 1];
        setEarnedBadge(newBadge);
        setShowBadge(true);
        setTimeout(() => setShowBadge(false), 2000);
      }
    }

  } catch (err) {
    console.error("Backend error:", err);
    console.error("Error details:", err.response?.data || err.message);
  }

  setShowAnswer(true);

  setTimeout(() => {
    setSelectedOption(-1);
    setShowAnswer(false);
    setTimeLeft(20);
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      handleQuizEnd();
    }
  }, 2000);
};
 
    const handleQuizEnd = () => {
    const scorePercent = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    if (scorePercent >= 70) {
      setShowConfetti(true);
      try { levelUp.play(); } catch {}
      if (!userStats.badges.includes("Quiz Master Badge")) {
        setEarnedBadge("Quiz Master Badge");
        setShowBadge(true);
        setUserStats(prev => ({ ...prev, badges: [...prev.badges, "Quiz Master Badge"] }));
        setTimeout(() => setShowBadge(false), 2000);
      }
    }
    onOpen();
  };

  const question = questions[currentIndex];
  let options = [];
  if (question?.options) {
    options = Array.isArray(question.options) ? question.options : JSON.parse(question.options);
  }

  return (
    <>
      <Navbar />
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered>
        <ModalOverlay />
        <ModalContent textAlign="center" bg="white">
          <ModalHeader fontSize="3xl" color="teal.600">🎉 Quiz Completed! 🎉</ModalHeader>
          <ModalCloseButton />
          <ModalBody fontSize="xl">
            <Text mb={4}>Congratulations on completing the quiz!</Text>
            <Box bg="blue.50" p={4} borderRadius="md" mb={4}>
              <Text fontSize="3xl" fontWeight="bold" color="blue.600">
                Score: {correctCount}/{totalQuestions}
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                {totalQuestions > 0 ? ((correctCount / totalQuestions) * 100).toFixed(0) : 0}%
              </Text>
            </Box>
            {totalQuestions > 0 && ((correctCount / totalQuestions) * 100) >= 70 ? (
              <Text fontSize="xl" color="green.600" fontWeight="bold">✅ Excellent! You passed!</Text>
            ) : (
              <Text fontSize="xl" color="orange.600" fontWeight="bold">📚 Keep practicing! You'll get there!</Text>
            )}
            {showBadge && (
              <ScaleFade initialScale={0.8} in={showBadge}>
                <Badge colorScheme="purple" fontSize="2xl" mt={3} p={3}>
                  🏆 {earnedBadge}
                </Badge>
              </ScaleFade>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" onClick={() => { 
              onClose(); 
              setShowConfetti(false);
            }} size="lg">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Container maxW="xl" py={8}>
        <Text textAlign="center" fontSize="3xl" fontWeight="bold" mb={5} color="white">🎯 Fun Quiz</Text>
        <Box bg="white" p={4} borderRadius="md" mb={5}>
          <Select placeholder="Select Test" value={langId} onChange={e => setLangId(e.target.value)} mb={3} size="lg">
            {languages.map(lang => (<option key={lang} value={lang}>{lang.toUpperCase().replace(/-/g, ' ')}</option>))}
          </Select>
          <Select placeholder="Select Language" value={category} onChange={e => setCategory(e.target.value)} size="lg">
            <option value="Arabic">العربية (Arabic)</option>
            <option value="French">Français (French)</option>
            <option value="English">English</option>
          </Select>
        </Box>

        {question && (
          <Box bg="white" color="black" borderRadius="md" p={6} shadow="lg" w="100%">
            <Box mb={4}>
              <Text fontWeight="bold" fontSize="lg" mb={2}>⏱️ Time Left: {timeLeft}s</Text>
              <Progress value={(timeLeft / 20) * 100} colorScheme={timeLeft <= 5 ? "red" : timeLeft <= 10 ? "orange" : "green"} size="md" borderRadius="md" hasStripe isAnimated />
            </Box>

            {question.image && (
              <Image src={question.image.startsWith('http') ? question.image : `http://localhost:5000${question.image}`} alt="Question illustration" maxH="300px" w="100%" objectFit="contain" borderRadius="md" mb={4} border="2px solid" borderColor="gray.200" onError={(e) => { e.target.style.display='none'; }} />
            )}

            <Badge colorScheme="blue" fontSize="md" mb={2}>Question {currentIndex + 1} of {questions.length}</Badge>
            <Text fontSize="2xl" fontWeight="bold" mb={4}>{question.desc}</Text>

            {showAnswer && (
              <Box p={3} borderRadius="md" mb={4} bg="gray.50">
                <Text fontSize="lg" fontWeight="bold" color="black">{feedback}</Text>
              </Box>
            )}

            <RadioGroup value={selectedOption === -1 ? "" : String(selectedOption)} onChange={(val) => !showAnswer && setSelectedOption(Number(val))}>
              <VStack spacing={3}>
                {options.map((option, idx) => {
                  const correctAnswer = Number(question.correct_answer);
                  const isSelected = selectedOption === idx;
                  const isCorrectOption = idx === correctAnswer;
                  return (
                    <Box key={idx} borderRadius="md" padding="12px" width="100%" borderWidth="2px"
                      borderColor={showAnswer && isCorrectOption ? "green.500" : showAnswer && isSelected && !isCorrectOption ? "red.500" : isSelected ? "blue.400" : "gray.200"}
                      bg={showAnswer && isCorrectOption ? "green.50" : showAnswer && isSelected && !isCorrectOption ? "red.50" : isSelected ? "blue.50" : "white"}
                      cursor={showAnswer ? "not-allowed" : "pointer"}
                      transition="all 0.2s"
                      _hover={!showAnswer ? { borderColor: "blue.300", transform: "scale(1.02)" } : {}}
                    >
                      <Radio value={String(idx)} isDisabled={showAnswer} size="lg">
                        <Text fontSize="lg">{option}</Text>
                      </Radio>
                    </Box>
                  );
                })}
              </VStack>
            </RadioGroup>

            <Center mt={6}>
              <Button 
                colorScheme="blue" 
                onClick={handleNext} 
                isDisabled={selectedOption === -1 || showAnswer} 
                size="lg" 
                px={10}
              >
                {currentIndex === questions.length - 1 ? "🏁 Finish Quiz" : "Next Question ➡️"}
              </Button>
            </Center>
          </Box>
        )}

        <Box mt={8} p={6} borderWidth="2px" borderRadius="md" bg="white" textAlign="center" shadow="md">
          <Text fontSize="xl" fontWeight="bold" mb={3} color="teal.600">📊 Your Progress</Text>
          <Text fontWeight="bold" fontSize="lg">Score: {correctCount}/{totalQuestions}</Text>
          <Text fontWeight="bold" fontSize="lg" mt={2}>XP: {userStats.xp}</Text>
          <Progress value={userStats.xp % 100} colorScheme="green" size="md" mb={3} mt={2} />
          <Text fontWeight="bold" fontSize="lg">Current Streak: {userStats.streak} 🔥</Text>
          <Text fontWeight="bold" mt={4} fontSize="lg">🏆 Badges:</Text>
          <VStack spacing={2} mt={3}>
            {userStats.badges.length > 0 ? userStats.badges.map((badge, i) => (
              <Badge key={i} colorScheme="yellow" fontSize="md" p={2}>{badge}</Badge>
            )) : <Text color="gray.500">No badges yet. Keep playing!</Text>}
          </VStack>
        </Box>
      </Container>
    </>
  );
};

export default TestPage;