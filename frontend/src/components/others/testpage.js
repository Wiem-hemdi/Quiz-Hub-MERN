import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box, Text, VStack, Radio, RadioGroup, Button, Container,
  Select, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalFooter, ModalCloseButton, useDisclosure, Center, Badge,
  Progress, Image, HStack, Input, Textarea,
  IconButton, Avatar, Flex, Spinner, Alert, AlertIcon,
  Drawer, DrawerBody, DrawerHeader, DrawerOverlay,
  DrawerContent, DrawerCloseButton, useDisclosure as useDrawerDisclosure,
  Card, CardBody, Divider, Heading, CloseButton, Tooltip,
  useColorModeValue, Grid, GridItem, Tabs, TabList, TabPanels, Tab, TabPanel,
  AspectRatio, Stack,SimpleGrid, useToast,Icon, Stat, StatLabel, StatNumber, StatHelpText
} from "@chakra-ui/react";
import axios from "axios";
import Navbar from "./navbar";
import Confetti from "react-confetti";
import { Howl } from "howler";
import { motion } from "framer-motion";
import {
  FaRobot, FaQuestionCircle, FaPaperPlane, FaTimes, FaSync,
  FaFire, FaBook, FaLanguage, FaTrophy, FaStar,
  FaChartLine, FaLightbulb, FaClock, FaCheckCircle,
  FaCrown, FaMedal, FaBolt, FaBrain, FaGraduationCap,
  FaBookOpen, FaCommentDots, FaRocket, FaAward,
  FaUsers, FaGlobe, FaFilter, FaEye, FaDownload,
  FaCalendarAlt, FaCog, FaArrowUp, FaArrowDown,
  FaHome, FaUserFriends, FaPalette, FaMagic,
  FaChevronRight, FaGamepad, FaShieldAlt
} from "react-icons/fa";
import { GiLaurelsTrophy, GiRank3, GiRank2, GiRank1 } from "react-icons/gi";

import levelUpSound from "./sound/levelup.wav";
import correctSoundFile from "./sound/correct.wav";
import incorrectSoundFile from "./sound/incorrect.mp3";
import countdownSoundFile from "./sound/countdown1.wav";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

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
  const [timeLeft, setTimeLeft] = useState(30);
  const [questionResults, setQuestionResults] = useState([]);
  const [availableTests, setAvailableTests] = useState([]);
  const [allTests, setAllTests] = useState([]);
  
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  
  const [aiQuery, setAiQuery] = useState("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiHistory, setAiHistory] = useState([]);
  
  const [activeTab, setActiveTab] = useState(0);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDrawerDisclosure();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const aiChatRef = useRef(null);
  const toast = useToast();

  // Thème et couleurs
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const accentColor = useColorModeValue("purple.600", "purple.300");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const gradient = useColorModeValue(
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #4c51bf 0%, #6b46c1 100%)"
  );

  // Sons
  const levelUp = new Howl({ src: [levelUpSound], volume: 0.7 });
  const correctSound = new Howl({ src: [correctSoundFile], volume: 0.6 });
  const incorrectSound = new Howl({ src: [incorrectSoundFile], volume: 0.6 });
  const countdownSound = new Howl({ src: [countdownSoundFile], volume: 0.5 });

  const getCorrectAnswerIndex = (question) => {
    if (!question || question.correct_answer === undefined || question.correct_answer === null) {
      return -1;
    }
    
    const raw = question.correct_answer;
    
    if (typeof raw === 'number' && raw >= 0 && raw <= 3) {
      return raw;
    }
    
    if (typeof raw === 'string') {
      const trimmed = raw.trim().toUpperCase();
      if (trimmed === 'A') return 0;
      if (trimmed === 'B') return 1;
      if (trimmed === 'C') return 2;
      if (trimmed === 'D') return 3;
      
      const num = parseInt(trimmed, 10);
      if (!isNaN(num) && num >= 0 && num <= 3) {
        return num;
      }
    }
    
    return -1;
  };

  useEffect(() => {
    console.log("📊 Updating counters from questionResults:", questionResults);
    
    let correct = 0;
    let incorrect = 0;
    
    questionResults.forEach(result => {
      if (result.isCorrect === true || result.isCorrect === "true" || result.isCorrect === 1) {
        correct++;
      } else if (result.isCorrect === false || result.isCorrect === "false" || result.isCorrect === 0) {
        if (result.selectedOption !== -1 && result.selectedOption !== "-1") {
          incorrect++;
        }
      }
    });
    
    console.log(`✅ Correct: ${correct}, ❌ Incorrect: ${incorrect}`);
    setCorrectCount(correct);
    setIncorrectCount(incorrect);
    setSessionScore(correct * 10);
  }, [questionResults]);

  useEffect(() => {
    if (aiChatRef.current) {
      aiChatRef.current.scrollTop = aiChatRef.current.scrollHeight;
    }
  }, [aiHistory]);

  useEffect(() => {
    const loadUserStats = async () => {
      if (userInfo?.token) {
        try {
          const response = await axios.get("http://localhost:5000/api/user/profile", {
            headers: { Authorization: `Bearer ${userInfo.token}` }
          });
          if (response.data.xp !== undefined) {
            setUserStats(prev => ({
              ...prev,
              xp: response.data.xp || 0,
              streak: response.data.streak || 0,
              badges: response.data.badges || []
            }));
          }
        } catch (error) {
          console.error("Failed to load user stats:", error);
        }
      }
    };
    
    loadUserStats();
  }, [userInfo]);

  const fetchAvailableTests = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const res = await axios.get("http://localhost:5000/quiz/languages", config);
      console.log("📋 Available tests:", res.data);
      setAllTests(res.data);
      setAvailableTests(res.data);
    } catch (err) {
      console.error("Error fetching tests:", err);
      const fallbackTests = ['CODE_DE_LA_ROUTE', 'ARABIC', 'JAVASCRIPT', 'TEST'];
      setAllTests(fallbackTests);
      setAvailableTests(fallbackTests);
    }
  }, [userInfo.token]);

  const fetchLanguages = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const res = await axios.get("http://localhost:5000/quiz/languages", config);
      console.log("🌍 Available languages:", res.data);
      setLanguages(res.data);
      fetchAvailableTests();
    } catch (err) {
      console.error(err);
    }
  }, [userInfo.token, fetchAvailableTests]);

  const getQuestions = useCallback(async (languageId, category) => {
    setIsLoadingQuestions(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const res = await axios.post(
        "http://localhost:5000/quiz/questions",
        { language_id: languageId, category },
        config
      );
      
      console.log("📚 Questions loaded:", res.data.length);
      
      if (languageId && category) {
        setQuestions(res.data);
        setQuestionResults([]);
        setCorrectCount(0);
        setIncorrectCount(0);
        setCurrentIndex(0);
        setSelectedOption(-1);
        setShowAnswer(false);
        setTimeLeft(30);
        setIsTimerRunning(true);
        
        setAiQuery("");
        setAiHistory([]);
        setAiError("");
        
        toast({
          title: "✅ Quiz chargé !",
          description: `${res.data.length} questions prêtes`,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top-right"
        });
      }
    } catch (err) {
      console.error("Error loading questions:", err);
      toast({
        title: "❌ Erreur",
        description: "Impossible de charger les questions",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    } finally {
      setIsLoadingQuestions(false);
    }
  }, [userInfo.token, toast]);

  useEffect(() => { 
    fetchLanguages(); 
  }, [fetchLanguages]);

  useEffect(() => {
    if (langId && category) {
      console.log(`🎯 Loading questions for: Language=${langId}, Category=${category}`);
      getQuestions(langId, category);
    }
  }, [langId, category, getQuestions]);

  useEffect(() => {
    if (!questions[currentIndex] || showAnswer || !isTimerRunning) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleNext();
          return 30;
        }
        if (prev <= 5) {
          countdownSound.play();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, showAnswer, questions, isTimerRunning]);

  const handleNext = async () => {
    setIsTimerRunning(false);
    const question = questions[currentIndex];
    
    const correctAnswerIndex = getCorrectAnswerIndex(question);
    const isCorrect = selectedOption === correctAnswerIndex;
    const wasAnswered = selectedOption !== -1;
    
    const dataToSend = {
      uid: userInfo._id,
      pairs: [{ 
        objectId: question._id, 
        givenAnswer: selectedOption === -1 ? -1 : Number(selectedOption)
      }],
    };

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const res = await axios.post("http://localhost:5000/quiz/answers", dataToSend, config);
      
      let isCorrectBackend = isCorrect;
      let correctAnswerText = question.options?.[correctAnswerIndex] || "N/A";
      let xpGained = 0;
      let newStreak = userStats.streak;
      
      if (res.data && res.data.pairs?.length) {
        const pair = res.data.pairs[0];
        
        if (pair.isCorrect === true || pair.isCorrect === "true" || pair.isCorrect === 1) {
          isCorrectBackend = true;
        } else if (pair.isCorrect === false || pair.isCorrect === "false" || pair.isCorrect === 0) {
          isCorrectBackend = false;
        }
        
        correctAnswerText = pair.correctAnswerText || correctAnswerText;
        
        if (wasAnswered && isCorrectBackend) {
          const baseXP = 15;
          const streakBonus = Math.min(userStats.streak * 3, 30);
          const timeBonus = timeLeft > 20 ? 10 : timeLeft > 10 ? 5 : 0;
          const difficultyBonus = currentIndex > 10 ? 5 : 0;
          xpGained = baseXP + streakBonus + timeBonus + difficultyBonus;
          
          newStreak = userStats.streak + 1;
          
          if (xpGained > 0) {
            toast({
              title: `🎯 +${xpGained} XP!`,
              description: `Streak: ${newStreak}`,
              status: "success",
              duration: 2000,
              isClosable: true,
              position: "top-right"
            });
          }
          
          setUserStats(prev => {
            const updatedStats = {
              ...prev,
              xp: prev.xp + xpGained,
              streak: newStreak
            };
            
            if (userInfo) {
              const updatedUser = { 
                ...userInfo, 
                xp: updatedStats.xp,
                streak: updatedStats.streak 
              };
              localStorage.setItem("userInfo", JSON.stringify(updatedUser));
            }
            
            return updatedStats;
          });
          
          correctSound.play();
          
        } else if (wasAnswered && !isCorrectBackend) {
          newStreak = 0;
          setUserStats(prev => ({ ...prev, streak: 0 }));
          incorrectSound.play();
          
          toast({
            title: "❌ Mauvaise réponse",
            description: `La bonne réponse était : ${correctAnswerText}`,
            status: "error",
            duration: 3000,
            isClosable: true
          });
        }
      }

      const newResult = {
        questionId: question._id,
        isCorrect: isCorrectBackend,
        selectedOption,
        wasAnswered,
        timestamp: new Date().toISOString(),
        xpGained: xpGained
      };
      
      setQuestionResults(prev => [...prev, newResult]);
      
      if (wasAnswered) {
        if (isCorrectBackend) {
          setCorrectCount(prev => prev + 1);
        } else {
          setIncorrectCount(prev => prev + 1);
        }
      }
      
      setFeedback(
        selectedOption === -1
          ? "⏱️ Temps écoulé !"
          : isCorrectBackend
            ? `✅ Correct ! +${xpGained} XP`
            : `❌ Faux ! Réponse correcte : "${correctAnswerText}"`
      );

      if (res.data.userStats) {
        const updatedStats = res.data.userStats;
        setUserStats(prev => {
          const mergedStats = {
            ...prev,
            xp: Math.max(prev.xp, updatedStats.xp || prev.xp),
            badges: updatedStats.badges || prev.badges,
            streak: updatedStats.streak || prev.streak
          };
          
          if (userInfo) {
            localStorage.setItem("userInfo", JSON.stringify({
              ...userInfo,
              xp: mergedStats.xp,
              streak: mergedStats.streak,
              badges: mergedStats.badges
            }));
          }
          
          return mergedStats;
        });
        
        if (res.data.newBadge) {
          setEarnedBadge(res.data.newBadge);
          setShowBadge(true);
          setTimeout(() => setShowBadge(false), 3000);
          
          toast({
            title: "🏆 Nouveau badge !",
            description: res.data.newBadge,
            status: "success",
            duration: 4000,
            isClosable: true,
            position: "top"
          });
        }
      }

    } catch (err) {
      console.error("❌ Backend error:", err);
      const correctAnswerText = question.options?.[correctAnswerIndex] || "N/A";
      
      if (wasAnswered && isCorrect) {
        correctSound.play();
      } else if (wasAnswered) {
        incorrectSound.play();
      }
      
      setFeedback(
        selectedOption === -1
          ? "⏱️ Temps écoulé !"
          : isCorrect
            ? `✅ Correct !`
            : `❌ Faux ! Réponse : "${correctAnswerText}"`
      );
    }

    setShowAnswer(true);
    
    setTimeout(() => {
      setSelectedOption(-1);
      setShowAnswer(false);
      setTimeLeft(30);
      setIsTimerRunning(true);
      
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        handleQuizEnd();
      }
    }, 2000);
  };

  const handleQuizEnd = async () => {
    const answeredQuestions = questionResults.length;
    const scorePercent = answeredQuestions > 0 ? (correctCount / answeredQuestions) * 100 : 0;

    if (scorePercent >= 70) {
      setShowConfetti(true);
      levelUp.play();
      
      try {
        const { data } = await axios.post(
          "http://localhost:5000/quiz/award-badge",
          { 
            badgeName: "Quiz Master Badge",
            userId: userInfo._id 
          },
          { headers: { Authorization: `Bearer ${userInfo.token}` } }
        );
        
        if (data.success) {
          setEarnedBadge("Quiz Master Badge");
          setShowBadge(true);
          setUserStats(prev => ({ 
            ...prev, 
            badges: [...prev.badges, "Quiz Master Badge"] 
          }));
        }
      } catch (err) {
        console.error("❌ Error awarding badge:", err);
      }
    }

    onOpen();
  };

  const askAI = async () => {
    if (!aiQuery.trim() || isLoadingAI) return;
    
    const question = questions[currentIndex];
    if (!question) {
      setAiError("Aucune question disponible");
      return;
    }

    setIsLoadingAI(true);
    setAiError("");
    
    const userMessage = aiQuery;
    setAiQuery("");
    
    setAiHistory(prev => [...prev, { 
      type: "user", 
      content: userMessage,
      timestamp: new Date().toISOString() 
    }]);

    try {
      const correctAnswerIndex = getCorrectAnswerIndex(question);
      const correctAnswerText = question.options && question.options[correctAnswerIndex] 
        ? question.options[correctAnswerIndex] 
        : "N/A";
      
      const requestData = {
        question: question.desc || "",
        userQuery: userMessage,
        options: question.options || [],
        correctAnswer: correctAnswerText,
        userAnswer: selectedOption !== -1 && question.options ? question.options[selectedOption] : null,
        wasAnswered: selectedOption !== -1
      };
      
      const response = await axios.post(
        "http://localhost:5000/api/ai/tutor-help",
        requestData,
        {
          headers: { "Content-Type": "application/json" },
          timeout: 30000
        }
      );
      
      let aiReply = response.data.response || "Je n'ai pas pu générer de réponse.";
      
      setAiHistory(prev => [...prev, { 
        type: "ai", 
        content: aiReply,
        timestamp: new Date().toISOString(),
        model: response.data?.model || "AI Assistant",
        language: response.data?.language || 'fr'
      }]);
      
    } catch (error) {
      console.error("❌ AI Request Failed:", error.message);
      
      const fallbackReply = `**Assistant Expert** 🎓\n\nPour approfondir cette question, je vous recommande de consulter les ressources officielles. En attendant, voici un conseil général : maintenez toujours une distance de sécurité suffisante et respectez les signalisations.`;
      
      setAiHistory(prev => [...prev, { 
        type: "ai", 
        content: fallbackReply,
        timestamp: new Date().toISOString(),
        model: "Expert Sécurité",
        isError: true
      }]);
      
      setAiError(`Service IA temporairement indisponible.`);
      
    } finally {
      setIsLoadingAI(false);
    }
  };

  const suggestions = [
    "Pourquoi cette réponse est correcte ?",
    "Expliquez-moi cette règle en détail",
    "Donnez un exemple pratique",
    "Quelles sont les exceptions ?",
    "Comment mémoriser cette règle ?",
    "Quelles sont les sanctions ?"
  ];

  const quickSuggestion = (text) => {
    setAiQuery(text);
    setTimeout(() => askAI(), 100);
  };

  const testAIConnection = async () => {
    try {
      const test1 = await axios.get("http://localhost:5000/api/ai/test", { timeout: 5000 });
      const test2 = await axios.get("http://localhost:5000/api/ai/test-ollama", { timeout: 5000 });
      
      toast({
        title: "✅ IA Opérationnelle",
        description: "L'assistant IA est prêt à vous aider !",
        status: "success",
        duration: 3000,
        isClosable: true
      });
      
    } catch (error) {
      toast({
        title: "⚠️ IA Non Disponible",
        description: "L'assistant IA est temporairement hors ligne",
        status: "warning",
        duration: 4000,
        isClosable: true
      });
    }
  };

  const question = questions[currentIndex];
  let options = [];
  if (question?.options) {
    try {
      if (Array.isArray(question.options)) {
        options = question.options;
      } else if (typeof question.options === 'string') {
        options = question.options.replace(/['"\[\]]/g, '').split(',').map(o => o.trim()).filter(o => o);
      }
    } catch (e) {
      options = ["Option A", "Option B", "Option C", "Option D"];
    }
  }

  const totalQuestions = questions.length;
  const answeredQuestions = questionResults.length;
  const unansweredQuestions = totalQuestions - answeredQuestions;
  const correctAnswerIndex = getCorrectAnswerIndex(question);
  const userLevel = Math.floor(userStats.xp / 100) + 1;

  return (
    <>
      <Navbar />
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} onConfettiComplete={() => setShowConfetti(false)} />}
      
      {/* Header Hero */}
      <Box
        bg={gradient}
        color="white"
        pt={20}
        pb={8}
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          background="radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)"
          zIndex="1"
        />
        
        <Container maxW="7xl" position="relative" zIndex="2">
          <Flex direction={{ base: "column", md: "row" }} alignItems="center" justifyContent="space-between" gap={8}>
            <VStack align={{ base: "center", md: "start" }} spacing={4}>
              <HStack spacing={4}>
                <Icon as={FaGamepad} boxSize={12} />
                <Heading size="2xl" fontWeight="bold">
                  Quiz Academy
                </Heading>
              </HStack>
              <Text fontSize="xl" opacity="0.9">
                Testez vos connaissances et progressez avec notre plateforme interactive
              </Text>
            </VStack>
            
            {/* Stats rapides */}
            <HStack spacing={6}>
              <Box textAlign="center">
                <Text fontSize="sm" opacity="0.8">Score actuel</Text>
                <Heading size="xl">{sessionScore}</Heading>
              </Box>
              <Box textAlign="center">
                <Text fontSize="sm" opacity="0.8">Streak</Text>
                <Heading size="xl" color="orange.300">{userStats.streak}</Heading>
              </Box>
              <Box textAlign="center">
                <Text fontSize="sm" opacity="0.8">Niveau</Text>
                <Heading size="xl" color="green.300">{userLevel}</Heading>
              </Box>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="7xl" py={8} px={{ base: 4, lg: 8 }}>
        {/* Navigation Tabs */}
        <Tabs variant="soft-rounded" colorScheme="purple" mb={8}>
          <TabList mb={6} bg={cardBg} p={2} borderRadius="xl" boxShadow="sm">
            <Tab onClick={() => setActiveTab(0)}>
              <Icon as={FaGamepad} mr={2} />
              Quiz Actif
            </Tab>
          
          
          </TabList>

          <TabPanels>
            {/* Panel 1: Quiz Actif */}
            <TabPanel p={0}>
              <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
                {/* Colonne principale */}
                <GridItem>
                  {/* Sélection du test */}
                  <MotionCard
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    bg={cardBg}
                    borderRadius="2xl"
                    boxShadow="lg"
                    mb={6}
                  >
                    <CardBody p={6}>
                      <Heading size="md" mb={6} display="flex" alignItems="center" gap={3}>
                        <Center w={10} h={10} borderRadius="lg" bg="blue.100">
                          <Icon as={FaBook} color="blue.500" />
                        </Center>
                        <span>Sélectionnez votre test</span>
                      </Heading>
                      
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        <Box>
                          <Text fontWeight="semibold" mb={2} color={textColor}>
                            <Icon as={FaGlobe} mr={2} />
                            Type de test
                          </Text>
                          <Select 
                            placeholder="Choisissez un test..." 
                            value={langId} 
                            onChange={e => {
                              const selectedTest = e.target.value;
                              setLangId(selectedTest);
                              if (selectedTest.includes('french') || selectedTest.toLowerCase().includes('france')) {
                                setCategory("French");
                              } else if (selectedTest.includes('arabic') || selectedTest.toLowerCase().includes('arab')) {
                                setCategory("Arabic");
                              } else {
                                setCategory("English");
                              }
                            }} 
                            size="lg"
                            focusBorderColor={accentColor}
                            bg={useColorModeValue("white", "gray.700")}
                            borderColor={borderColor}
                          >
                            {availableTests.map((test, index) => (
                              <option key={index} value={test}>
                                {test.replace(/_/g, ' ')}
                              </option>
                            ))}
                          </Select>
                        </Box>
                        
                        {langId && (
                          <Box>
                            <Text fontWeight="semibold" mb={2} color={textColor}>
                              <Icon as={FaLanguage} mr={2} />
                              Langue
                            </Text>
                            <Select 
                              placeholder="Sélectionnez la langue..." 
                              value={category} 
                              onChange={e => setCategory(e.target.value)} 
                              size="lg"
                              focusBorderColor={accentColor}
                              bg={useColorModeValue("white", "gray.700")}
                              borderColor={borderColor}
                            >
                              <option value="Arabic">🇸🇦 Arabe</option>
                              <option value="French">🇫🇷 Français</option>
                              <option value="English">🇬🇧 Anglais</option>
                            </Select>
                          </Box>
                        )}
                      </SimpleGrid>
                      
                      {langId && category && (
                        <Alert 
                          status="success" 
                          borderRadius="lg" 
                          mt={4}
                          variant="left-accent"
                        >
                          <AlertIcon />
                          <Box>
                            <Text fontWeight="bold">Test prêt !</Text>
                            <Text fontSize="sm">
                              {langId.replace(/_/g, ' ')} ({category})
                              {questions.length > 0 && ` • ${questions.length} questions`}
                            </Text>
                          </Box>
                        </Alert>
                      )}
                    </CardBody>
                  </MotionCard>

                  {/* Question courante */}
                  {question && (
                    <MotionCard
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      bg={cardBg}
                      borderRadius="2xl"
                      boxShadow="lg"
                    >
                      <CardBody p={8}>
                        {/* En-tête */}
                        <Flex justifyContent="space-between" alignItems="center" mb={8}>
                          <HStack>
                            <Badge 
                              colorScheme="purple" 
                              fontSize="lg" 
                              px={4} 
                              py={2}
                              borderRadius="full"
                            >
                              Question {currentIndex + 1} / {questions.length}
                            </Badge>
                            <Tooltip label="Demander de l'aide à l'IA" hasArrow>
                              <Button
                                size="sm"
                                colorScheme="green"
                                variant="outline"
                                leftIcon={<FaBrain />}
                                onClick={onDrawerOpen}
                              >
                                Assistant IA
                              </Button>
                            </Tooltip>
                          </HStack>
                          
                          <Box textAlign="center">
                            <Text fontSize="sm" color="gray.500">Temps restant</Text>
                            <Text 
                              fontSize="2xl" 
                              fontWeight="bold"
                              color={timeLeft <= 5 ? "red.500" : timeLeft <= 15 ? "orange.500" : "green.500"}
                            >
                              {timeLeft}s
                            </Text>
                          </Box>
                        </Flex>

                        {/* Timer bar */}
                        <Box mb={8}>
                          <Progress 
                            value={(timeLeft / 30) * 100} 
                            colorScheme={timeLeft <= 5 ? "red" : timeLeft <= 15 ? "orange" : "green"} 
                            size="lg" 
                            borderRadius="full"
                            hasStripe 
                            isAnimated 
                          />
                        </Box>

                        {/* Image */}
                        {question.image && (
                          <AspectRatio ratio={16/9} mb={8} borderRadius="lg" overflow="hidden">
                            <Image 
                              src={question.image.startsWith('http') ? question.image : `http://localhost:5000${question.image}`} 
                              alt="Illustration" 
                              objectFit="cover"
                              onError={(e) => { e.target.style.display='none'; }} 
                            />
                          </AspectRatio>
                        )}

                        {/* Question */}
                        <Text 
                          fontSize="2xl" 
                          fontWeight="bold" 
                          mb={8} 
                          color={textColor}
                          lineHeight="tall"
                        >
                          {question.desc}
                        </Text>

                        {/* Feedback */}
                        {showAnswer && feedback && (
                          <MotionBox
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                          >
                            <Box 
                              p={5} 
                              borderRadius="xl" 
                              mb={8}
                              bg={feedback.includes("✅") ? "green.50" : "red.50"}
                              borderWidth="2px"
                              borderColor={feedback.includes("✅") ? "green.200" : "red.200"}
                            >
                              <HStack spacing={3} mb={2}>
                                {feedback.includes("✅") ? (
                                  <Icon as={FaCheckCircle} color="green.500" boxSize={5} />
                                ) : (
                                  <Icon as={FaTimes} color="red.500" boxSize={5} />
                                )}
                                <Text fontSize="lg" fontWeight="bold" color={textColor}>
                                  {feedback}
                                </Text>
                              </HStack>
                              
                              {feedback.includes("✅") && userStats.streak > 0 && (
                                <HStack>
                                  <Icon as={FaFire} color="orange.500" />
                                  <Text color="orange.600" fontWeight="bold">
                                    Streak actuel : {userStats.streak}
                                  </Text>
                                </HStack>
                              )}
                            </Box>
                          </MotionBox>
                        )}

                        {/* Options */}
                        <RadioGroup value={selectedOption === -1 ? "" : String(selectedOption)} 
                                   onChange={(val) => !showAnswer && setSelectedOption(Number(val))}>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            {options.map((option, idx) => {
                              const isSelected = selectedOption === idx;
                              const isCorrectOption = idx === correctAnswerIndex;
                              
                              return (
                                <MotionBox
                                  key={idx}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.1 }}
                                >
                                  <Box
                                    borderRadius="xl"
                                    p={5}
                                    borderWidth="2px"
                                    borderColor={showAnswer ? 
                                      (isCorrectOption ? "green.500" : isSelected ? "red.500" : borderColor) : 
                                      isSelected ? "blue.500" : borderColor
                                    }
                                    bg={showAnswer ? 
                                      (isCorrectOption ? "green.50" : isSelected ? "red.50" : cardBg) : 
                                      isSelected ? "blue.50" : cardBg
                                    }
                                    cursor={showAnswer ? "default" : "pointer"}
                                    transition="all 0.2s"
                                    _hover={!showAnswer ? {
                                      transform: "translateY(-2px)",
                                      boxShadow: "md",
                                      borderColor: accentColor
                                    } : {}}
                                  >
                                    <Radio value={String(idx)} isDisabled={showAnswer} width="100%">
                                      <Flex alignItems="center" gap={4}>
                                        <Center
                                          w={10}
                                          h={10}
                                          borderRadius="lg"
                                          bg={showAnswer ? 
                                            (isCorrectOption ? "green.500" : isSelected ? "red.500" : "gray.200") : 
                                            isSelected ? "blue.500" : "gray.200"
                                          }
                                          color="white"
                                          fontWeight="bold"
                                        >
                                          {String.fromCharCode(65 + idx)}
                                        </Center>
                                        <Text fontSize="lg" flex={1}>
                                          {option}
                                        </Text>
                                        {showAnswer && isCorrectOption && (
                                          <Icon as={FaCheckCircle} color="green.500" boxSize={5} />
                                        )}
                                      </Flex>
                                    </Radio>
                                  </Box>
                                </MotionBox>
                              );
                            })}
                          </SimpleGrid>
                        </RadioGroup>

                        {/* Bouton suivant */}
                        <Center mt={10}>
                          <Button 
                            colorScheme="purple"
                            onClick={handleNext} 
                            isDisabled={selectedOption === -1 || showAnswer || isLoadingQuestions} 
                            size="lg" 
                            px={12}
                            py={6}
                            fontSize="lg"
                            leftIcon={currentIndex === questions.length - 1 ? <FaTrophy /> : null}
                            bgGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                            _hover={{
                              bgGradient: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                              transform: "translateY(-2px)",
                              boxShadow: "xl"
                            }}
                            _active={{ transform: "translateY(0)" }}
                            transition="all 0.3s"
                            isLoading={isLoadingQuestions}
                            loadingText="Chargement..."
                          >
                            {currentIndex === questions.length - 1 ? "🏁 Terminer le Quiz" : "Question Suivante →"}
                          </Button>
                        </Center>
                      </CardBody>
                    </MotionCard>
                  )}
                </GridItem>

                {/* Colonne stats */}
                <GridItem>
                  {/* Stats utilisateur */}
                  <MotionCard
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    bg={cardBg}
                    borderRadius="2xl"
                    boxShadow="lg"
                    mb={6}
                  >
                    <CardBody>
                      <Heading size="md" mb={6} display="flex" alignItems="center" gap={2}>
                        <Icon as={FaChartLine} />
                        Statistiques
                      </Heading>

                      {/* Niveau et XP */}
                      <Card 
                        bgGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        color="white"
                        borderRadius="xl"
                        mb={6}
                      >
                        <CardBody textAlign="center">
                          <Text fontSize="sm" opacity={0.9}>Niveau actuel</Text>
                          <Heading size="3xl" mb={2}>{userLevel}</Heading>
                          <Progress 
                            value={userStats.xp % 100} 
                            colorScheme="whiteAlpha" 
                            size="sm" 
                            borderRadius="full"
                            mb={2}
                          />
                          <Text fontSize="sm">
                            {userStats.xp % 100}/100 XP • Total: {userStats.xp} XP
                          </Text>
                        </CardBody>
                      </Card>

                      {/* Score actuel */}
                      <Box mb={6}>
                        <Text fontWeight="semibold" mb={4} color={textColor}>Score de cette session</Text>
                        <SimpleGrid columns={3} spacing={3}>
                          <Box textAlign="center" p={3} bg="green.50" borderRadius="lg">
                            <Text fontSize="2xl" fontWeight="bold" color="green.600">{correctCount}</Text>
                            <Text fontSize="xs" color="green.700">Correctes</Text>
                          </Box>
                          <Box textAlign="center" p={3} bg="red.50" borderRadius="lg">
                            <Text fontSize="2xl" fontWeight="bold" color="red.600">{incorrectCount}</Text>
                            <Text fontSize="xs" color="red.700">Incorrectes</Text>
                          </Box>
                          <Box textAlign="center" p={3} bg="gray.100" borderRadius="lg">
                            <Text fontSize="2xl" fontWeight="bold" color="gray.600">{unansweredQuestions}</Text>
                            <Text fontSize="xs" color="gray.700">Restantes</Text>
                          </Box>
                        </SimpleGrid>
                      </Box>

                      {/* Streak */}
                      <Box mb={6} p={4} bg="orange.50" borderRadius="xl">
                        <HStack justify="space-between" mb={3}>
                          <HStack>
                            <Icon as={FaFire} color="orange.500" />
                            <Text fontWeight="bold" color="orange.700">Série actuelle</Text>
                          </HStack>
                          <Badge colorScheme="orange">{userStats.streak}</Badge>
                        </HStack>
                        <Progress 
                          value={Math.min(userStats.streak * 10, 100)} 
                          colorScheme="orange" 
                          size="sm" 
                          borderRadius="full"
                        />
                        <Text fontSize="sm" color="orange.500" mt={2} textAlign="center">
                          {userStats.streak >= 10 ? "🔥 INCROYABLE !" : 
                           userStats.streak >= 5 ? "🔥 Excellente série !" : 
                           "Continuez comme ça !"}
                        </Text>
                      </Box>

                      {/* Badges */}
                      <Box>
                        <HStack justify="space-between" mb={4}>
                          <Text fontWeight="semibold" color={textColor}>🏆 Vos Badges</Text>
                          <Badge colorScheme="purple">{userStats.badges.length}</Badge>
                        </HStack>
                        
                        {userStats.badges.length > 0 ? (
                          <SimpleGrid columns={2} spacing={2}>
                            {userStats.badges.slice(0, 4).map((badge, i) => (
                              <Box 
                                key={i}
                                bg="purple.50" 
                                p={2} 
                                borderRadius="lg" 
                                textAlign="center"
                                borderWidth="1px"
                                borderColor="purple.200"
                              >
                                <Text fontSize="xs" fontWeight="bold" color="purple.600" noOfLines={1}>
                                  {badge}
                                </Text>
                              </Box>
                            ))}
                          </SimpleGrid>
                        ) : (
                          <Box 
                            bg="gray.100" 
                            p={4} 
                            borderRadius="lg" 
                            textAlign="center"
                          >
                            <Text color="gray.500" fontSize="sm">
                              Aucun badge encore. Continuez à jouer !
                            </Text>
                          </Box>
                        )}
                      </Box>
                    </CardBody>
                  </MotionCard>

                  {/* Assistant IA */}
                  <MotionCard
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    bg={cardBg}
                    borderRadius="2xl"
                    boxShadow="lg"
                  >
                    <CardBody>
                      <Heading size="md" mb={4} display="flex" alignItems="center" gap={2}>
                        <Icon as={FaBrain} />
                        Assistant IA
                      </Heading>
                      
                      <Text color="gray.600" mb={4} fontSize="sm">
                        Bloqué sur une question ? Notre assistant IA vous explique chaque règle en détail.
                      </Text>
                      
                      <VStack spacing={3}>
                        <Button 
                          onClick={onDrawerOpen}
                          colorScheme="purple"
                          leftIcon={<FaBrain />}
                          width="100%"
                          size="lg"
                          bgGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                          _hover={{
                            bgGradient: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                            transform: "translateY(-2px)"
                          }}
                        >
                          Ouvrir l'Assistant
                        </Button>
                        
                        <Button 
                          onClick={testAIConnection}
                          colorScheme="green"
                          variant="outline"
                          leftIcon={<FaSync />}
                          width="100%"
                        >
                          Tester la Connexion
                        </Button>
                      </VStack>
                      
                      <Divider my={4} />
                      
                      <Box 
                        bg="blue.50" 
                        p={3} 
                        borderRadius="lg"
                        borderWidth="1px"
                        borderColor="blue.200"
                      >
                        <Text fontSize="sm" fontWeight="bold" color="blue.700" mb={1}>
                          💡 Conseil expert
                        </Text>
                        <Text fontSize="sm" color="blue.600">
                          En ville, maintenez une distance de sécurité d'au moins 2 secondes avec le véhicule devant vous.
                        </Text>
                      </Box>
                    </CardBody>
                  </MotionCard>
                </GridItem>
              </Grid>
            </TabPanel>

           
          </TabPanels>
        </Tabs>
      </Container>

      {/* Modal de fin de quiz */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent borderRadius="2xl" overflow="hidden" bg={cardBg}>
          <ModalHeader 
            bgGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            color="white"
            textAlign="center"
            py={8}
          >
            <VStack>
              <Icon as={FaTrophy} boxSize={12} />
              <Heading size="xl">Quiz Terminé ! 🎉</Heading>
            </VStack>
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py={8}>
            <VStack spacing={8}>
              {/* Score principal */}
              <Box textAlign="center">
                <Text fontSize="5xl" fontWeight="bold" bgGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" bgClip="text">
                  {correctCount}/{answeredQuestions}
                </Text>
                <Text fontSize="xl" color="gray.600">
                  {answeredQuestions > 0 ? ((correctCount / answeredQuestions) * 100).toFixed(0) : 0}% de réussite
                </Text>
              </Box>
              
              {/* Statistiques */}
              <SimpleGrid columns={3} spacing={4} width="100%">
                <Box textAlign="center" p={4} bg="green.50" borderRadius="xl">
                  <StatNumber color="green.600" fontSize="2xl">{correctCount}</StatNumber>
                  <StatLabel>Correctes</StatLabel>
                </Box>
                <Box textAlign="center" p={4} bg="red.50" borderRadius="xl">
                  <StatNumber color="red.600" fontSize="2xl">{incorrectCount}</StatNumber>
                  <StatLabel>Incorrectes</StatLabel>
                </Box>
                <Box textAlign="center" p={4} bg="gray.100" borderRadius="xl">
                  <StatNumber color="gray.600" fontSize="2xl">{unansweredQuestions}</StatNumber>
                  <StatLabel>Non répondues</StatLabel>
                </Box>
              </SimpleGrid>
              
              {/* Score */}
              <Box 
                bgGradient="linear-gradient(135deg, #f6d365 0%, #fda085 100%)"
                p={6}
                borderRadius="xl"
                width="100%"
                textAlign="center"
                color="white"
              >
                <Text fontSize="xl" fontWeight="bold">
                  🎯 Score : {sessionScore} points
                </Text>
                <Text>
                  XP Total : {userStats.xp} • Niveau {userLevel}
                </Text>
              </Box>
              
              {/* Badge */}
              {showBadge && (
                <MotionBox
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <Box 
                    bgGradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                    p={6}
                    borderRadius="xl"
                    width="100%"
                    textAlign="center"
                    color="white"
                  >
                    <Icon as={FaMedal} boxSize={8} mb={2} />
                    <Text fontSize="lg" fontWeight="bold">
                      🏆 {earnedBadge} 🏆
                    </Text>
                  </Box>
                </MotionBox>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button 
              colorScheme="purple"
              onClick={() => { 
                onClose(); 
                setShowConfetti(false);
              }} 
              size="lg"
              width="100%"
              leftIcon={<FaRocket />}
              bgGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
            >
              Continuer l'apprentissage
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Drawer Assistant IA */}
      <Drawer 
        isOpen={isDrawerOpen} 
        placement="right" 
        onClose={onDrawerClose} 
        size="md"
      >
        <DrawerOverlay backdropFilter="blur(4px)" />
        <DrawerContent borderRadius="lg" overflow="hidden" bg={cardBg}>
          <DrawerHeader 
            bgGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            color="white"
            py={6}
          >
            <Flex alignItems="center" justifyContent="space-between">
              <HStack spacing={3}>
                <Center w={10} h={10} borderRadius="lg" bg="whiteAlpha.200">
                  <Icon as={FaBrain} />
                </Center>
                <VStack align="start" spacing={0}>
                  <Text fontSize="lg" fontWeight="bold">Assistant IA Expert</Text>
                  <Text fontSize="xs" opacity={0.9}>Spécialiste code de la route</Text>
                </VStack>
              </HStack>
              <DrawerCloseButton position="relative" color="white" />
            </Flex>
          </DrawerHeader>

          <DrawerBody p={0} display="flex" flexDirection="column">
            <Box 
              ref={aiChatRef}
              flex="1" 
              p={4} 
              overflowY="auto" 
              maxH="60vh"
              minH="300px"
              bg={useColorModeValue("gray.50", "gray.900")}
            >
              {aiHistory.length === 0 ? (
                <Center height="100%" flexDirection="column" p={4} textAlign="center">
                  <Avatar 
                    icon={<FaBrain />}
                    bgGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    color="white"
                    size="xl"
                    mb={4}
                  />
                  <Text fontSize="lg" fontWeight="bold" color={textColor} mb={2}>
                    🤖 Votre Expert Personnel
                  </Text>
                  <Text color="gray.500" mb={6}>
                    Posez-moi n'importe quelle question sur la question actuelle.
                  </Text>
                  
                  <Box width="100%">
                    <Text fontWeight="bold" mb={3} color={textColor}>💡 Suggestions rapides :</Text>
                    <SimpleGrid columns={2} spacing={2}>
                      {suggestions.map((suggestion, index) => (
                        <Card 
                          key={index}
                          variant="outline" 
                          size="sm" 
                          cursor="pointer" 
                          onClick={() => quickSuggestion(suggestion)}
                          _hover={{ 
                            bg: "blue.50", 
                            borderColor: "blue.200",
                            transform: "translateY(-2px)",
                            shadow: "md"
                          }}
                          transition="all 0.2s"
                          bg="white"
                        >
                          <CardBody py={2} px={3}>
                            <Text fontSize="sm">{suggestion}</Text>
                          </CardBody>
                        </Card>
                      ))}
                    </SimpleGrid>
                  </Box>
                </Center>
              ) : (
                <VStack spacing={4} align="stretch">
                  {aiHistory.map((message, index) => (
                    <Box 
                      key={index} 
                      alignSelf={message.type === "user" ? "flex-end" : "flex-start"} 
                      maxW="85%"
                    >
                      <Flex alignItems="flex-start" gap={3}>
                        {message.type === "ai" && (
                          <Avatar 
                            size="sm" 
                            icon={<FaBrain />}
                            bgGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                            color="white"
                          />
                        )}
                        <Box
                          bg={message.type === "user" ? gradient : "white"}
                          color={message.type === "user" ? "white" : textColor}
                          p={4}
                          borderRadius="lg"
                          borderWidth="1px"
                          borderColor={message.type === "user" ? "transparent" : borderColor}
                          boxShadow="sm"
                          flex="1"
                        >
                          <Text whiteSpace="pre-wrap" fontSize="sm">
                            {message.content}
                          </Text>
                          {message.type === "ai" && message.model && (
                            <Text fontSize="xs" color="gray.500" mt={2}>
                              <Flex alignItems="center" gap={1}>
                                <Icon as={FaGraduationCap} boxSize={3} />
                                {message.model} • {message.language || 'fr'}
                              </Flex>
                            </Text>
                          )}
                        </Box>
                        {message.type === "user" && (
                          <Avatar 
                            size="sm" 
                            name={userInfo?.name || "Utilisateur"}
                            bg="purple.500"
                            color="white"
                          />
                        )}
                      </Flex>
                    </Box>
                  ))}
                  
                  {isLoadingAI && (
                    <Flex alignItems="center" gap={3} p={3} bg="white" borderRadius="lg" shadow="sm">
                      <Spinner size="sm" color="blue.500" />
                      <VStack align="start" spacing={0}>
                        <Text color="gray.500" fontSize="sm">L'IA réfléchit...</Text>
                        <Text color="gray.400" fontSize="xs">Analyse en cours</Text>
                      </VStack>
                    </Flex>
                  )}
                </VStack>
              )}
            </Box>

            <Box p={4} borderTopWidth="1px" borderColor={borderColor} bg="white">
              {aiError && (
                <Alert status="error" mb={3} borderRadius="md" size="sm">
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="bold">Attention</Text>
                    <Text fontSize="sm">{aiError}</Text>
                  </Box>
                  <CloseButton onClick={() => setAiError("")} />
                </Alert>
              )}
              
              <VStack spacing={3}>
                <Textarea
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      askAI();
                    }
                  }}
                  placeholder="Posez votre question..."
                  size="sm"
                  rows={2}
                  resize="vertical"
                  isDisabled={isLoadingAI}
                  focusBorderColor="blue.500"
                  borderColor={borderColor}
                  _hover={{ borderColor: "blue.300" }}
                />
                
                <Flex width="100%" justifyContent="space-between" alignItems="center">
                  <HStack spacing={2}>
                    <Button
                      size="xs"
                      colorScheme="blue"
                      variant="ghost"
                      onClick={testAIConnection}
                      leftIcon={<FaSync />}
                    >
                      Tester l'IA
                    </Button>
                  </HStack>
                  
                  <Button
                    colorScheme="blue"
                    onClick={askAI}
                    isLoading={isLoadingAI}
                    loadingText="Envoi..."
                    rightIcon={<FaPaperPlane />}
                    isDisabled={!aiQuery.trim() || isLoadingAI}
                    size="sm"
                    bgGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    _hover={{
                      bgGradient: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                      transform: "translateY(-1px)"
                    }}
                  >
                    Envoyer
                  </Button>
                </Flex>
              </VStack>
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default TestPage;