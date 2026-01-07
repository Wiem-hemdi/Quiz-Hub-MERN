import React, { useState, useEffect, useRef } from "react";
import {
  Box, Heading, Text, VStack, HStack, Button, Input,
  IconButton, Avatar, Card, CardBody, Flex, Badge,
  useDisclosure, Drawer, DrawerBody,
  DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton,
  Tooltip, Divider, Spinner, Alert, AlertIcon,
  SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText,
  Image, Container, useColorModeValue, Textarea,
  Icon, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, ModalCloseButton, Center,
  Fade, ScaleFade, SlideFade, Stack, AspectRatio
} from "@chakra-ui/react";
import axios from "axios";
import Navbar from "../components/others/navbar";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Icons
import {
  FaRobot, FaPaperPlane, FaQuestionCircle, FaCar,
  FaGraduationCap, FaTrophy, FaUsers, FaChartLine,
  FaLightbulb, FaBrain, FaStar, FaAward,
  FaTimes, FaSync, FaComments, FaRocket,
  FaBook, FaRoad, FaTrafficLight, FaShieldAlt,
  FaHome, FaGlobe, FaUserFriends, FaCog,
  FaFire, FaGem, FaCrown, FaArrowRight,
  FaMagic, FaPalette, FaEye, FaDownload,
  FaCalendarAlt, FaFilter, FaCaretDown,
  FaCaretUp, FaMedal, FaLanguage,
  FaPlayCircle, FaCheckCircle, FaUserGraduate,
  FaMapSigns, FaStopwatch, FaBalanceScale,
  FaHandshake, FaExclamationTriangle
} from "react-icons/fa";
import { GiSteeringWheel, GiRoad, GiStopSign, GiLaurelsTrophy, GiCarKey } from "react-icons/gi";
import { MdSpeed, MdLocalPolice, MdDirectionsCar } from "react-icons/md";

const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MotionFlex = motion(Flex);
const MotionButton = motion(Button);

const Mainpage = () => {
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const chatRef = useRef(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
  const navigate = useNavigate();

  // Couleurs pour le dégradé clair → sombre
  const topBgColor = useColorModeValue("#ffffff", "gray.50"); // Très clair en haut
  const middleBgColor = useColorModeValue("gray.50", "gray.900"); // Sombre au milieu
  const bottomBgColor = useColorModeValue("gray.50", "gray.900"); // Reste sombre
  
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const secondaryTextColor = useColorModeValue("gray.600", "gray.300");
  const accentColor = useColorModeValue("#4f46e5", "#818cf8");
  const accentGradient = "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)";
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const successColor = useColorModeValue("#10b981", "#34d399");

  const drivingTopics = [
    {
      icon: <FaTrafficLight />,
      title: "Feux de signalisation",
      questions: [
        "Que signifie un feu orange ?",
        "Que faire au feu rouge ?",
        "Peut-on tourner à droite au feu rouge ?"
      ],
      color: "red.400"
    },
    {
      icon: <GiStopSign />,
      title: "Panneaux routiers",
      questions: [
        "Que signifie le panneau STOP ?",
        "Comment reconnaître un panneau de priorité ?",
        "Que faire devant un panneau 'Cédez le passage' ?"
      ],
      color: "blue.400"
    },
    {
      icon: <MdSpeed />,
      title: "Vitesse & Distance",
      questions: [
        "Quelle est la vitesse en ville ?",
        "Comment calculer la distance de sécurité ?",
        "Vitesse par temps de pluie ?"
      ],
      color: "green.400"
    },
    {
      icon: <GiSteeringWheel />,
      title: "Manœuvres",
      questions: [
        "Comment prendre un rond-point ?",
        "Quand peut-on dépasser ?",
        "Comment faire un créneau ?"
      ],
      color: "purple.400"
    }
  ];

  const features = [
    {
      icon: <FaBrain />,
      title: "Assistant IA Expert",
      description: "Réponses détaillées 24/7 sur le code de la route",
      color: "#3b82f6"
    },
    {
      icon: <FaGraduationCap />,
      title: "Quiz Adaptatifs",
      description: "Questions personnalisées selon votre niveau",
      color: "#10b981"
    },
    {
      icon: <FaChartLine />,
      title: "Suivi Intelligent",
      description: "Statistiques détaillées et progrès visualisés",
      color: "#8b5cf6"
    },
    {
      icon: <FaTrophy />,
      title: "Récompenses",
      description: "Badges, XP et classements motivants",
      color: "#f59e0b"
    }
  ];

  const quickSuggestions = [
    { text: "Qu'est-ce qu'un feu orange ?", icon: <FaTrafficLight /> },
    { text: "Distance de sécurité minimale ?", icon: <FaStopwatch /> },
    { text: "Comment prendre un rond-point ?", icon: <GiSteeringWheel /> },
    { text: "Alcool au volant : quelle limite ?", icon: <FaExclamationTriangle /> }
  ];

  const sendChatMessage = async (message = null) => {
    const question = message || chatInput.trim();
    if (!question) return;

    setIsChatLoading(true);
    setAiError("");
    
    const userMessage = {
      id: Date.now(),
      type: "user",
      content: question,
      timestamp: new Date().toISOString()
    };
    
    setChatHistory(prev => [...prev, userMessage]);
    setChatInput("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/ai/tutor-help",
        { question: question },
        { 
          headers: { "Content-Type": "application/json" },
          timeout: 40000  
        }
      );

      const aiMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: response.data.response,
        source: response.data.source || "AI Tutor",
        model: response.data.model || "phi:2.7b",
        timestamp: new Date().toISOString(),
        language: response.data.language || 'fr'
      };

      setChatHistory(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error("Chat error:", error);
      setAiError(error.response?.data?.message || error.message || "Erreur de connexion");
      
      const fallbackMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: "Je suis désolé, je rencontre des difficultés techniques. Voici une réponse générale : \n\nEn conduite, la sécurité est primordiale. Toujours respecter les limitations de vitesse, maintenir une distance de sécurité, et être attentif aux autres usagers. Pour une réponse plus précise, consultez votre manuel du code de la route.",
        source: "fallback",
        timestamp: new Date().toISOString()
      };

      setChatHistory(prev => [...prev, fallbackMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const clearChat = () => {
    setChatHistory([]);
  };

  useEffect(() => {
    if (showWelcomeMessage && chatHistory.length === 0) {
      const welcomeMessage = {
        id: 1,
        type: "ai",
        content: `👋 Bonjour ${userInfo.name || "conducteur"} ! Je suis votre assistant IA spécialisé en code de la route. Posez-moi n'importe quelle question sur la conduite, les panneaux, les priorités, etc.`,
        source: "welcome",
        timestamp: new Date().toISOString()
      };
      setChatHistory([welcomeMessage]);
    }
  }, [showWelcomeMessage, userInfo.name]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <>
      <Navbar />
      
      {/* Section Hero - CLAIR */}
      <Box
        minH="100vh"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        bg={topBgColor}
        color="gray.800"
        w="100%"
        p={4}
        position="relative"
        overflow="hidden"
      >
        {/* Éléments décoratifs légers */}
        <Box
          position="absolute"
          top="10%"
          right="10%"
          w="400px"
          h="400px"
          borderRadius="full"
          bg="linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(124, 58, 237, 0.03) 100%)"
          filter="blur(40px)"
          zIndex="1"
        />
        
        <Box
          position="absolute"
          bottom="20%"
          left="10%"
          w="300px"
          h="300px"
          borderRadius="full"
          bg="linear-gradient(135deg, rgba(16, 185, 129, 0.03) 0%, rgba(59, 130, 246, 0.02) 100%)"
          filter="blur(40px)"
          zIndex="1"
        />

        <Container maxW="7xl" position="relative" zIndex="2">
          <VStack spacing={12}>
            {/* Titre principal */}
            <ScaleFade in={true} initialScale={0.9}>
              <VStack spacing={6}>
                <Badge
                  bg={`${accentColor}15`}
                  color={accentColor}
                  px={6}
                  py={2}
                  borderRadius="full"
                  fontSize="sm"
                  fontWeight="semibold"
                  border="1px solid"
                  borderColor={`${accentColor}30`}
                >
                  🚗 L'Expert du Code de la Route
                </Badge>
                
                <Heading
                  as="h1"
                  fontSize={{ base: "4xl", md: "6xl", lg: "7xl" }}
                  fontWeight="black"
                  lineHeight="1.1"
                  maxW="900px"
                >
                  Maîtrisez le code de la route avec{" "}
                  <Box
                    as="span"
                    bgGradient={accentGradient}
                    bgClip="text"
                  >
                    intelligence
                  </Box>
                </Heading>

                <Text
                  fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
                  color="gray.600"
                  maxW="800px"
                  fontWeight="medium"
                >
                  La plateforme d'apprentissage la plus avancée, combinant IA, 
                  quiz interactifs et suivi personnalisé pour votre réussite.
                </Text>
              </VStack>
            </ScaleFade>

            {/* CTA Buttons */}
            <SlideFade in={true} offsetY="20px">
              <Stack
                direction={{ base: "column", sm: "row" }}
                spacing={6}
                align="center"
                justify="center"
              >
                <Button
                  as={motion.button}
                  leftIcon={<FaCar />}
                  size="lg"
                  px={10}
                  py={7}
                  fontSize="lg"
                  bgGradient={accentGradient}
                  color="white"
                  _hover={{
                    transform: "translateY(-4px)",
                    boxShadow: "0 20px 40px rgba(79, 70, 229, 0.4)"
                  }}
                  _active={{
                    transform: "translateY(-1px)"
                  }}
                  onClick={() => navigate("/quiz")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  Commencer un Quiz
                </Button>

                <Button
                  as={motion.button}
                  leftIcon={<FaRobot />}
                  size="lg"
                  px={10}
                  py={7}
                  fontSize="lg"
                  variant="outline"
                  borderWidth="2px"
                  borderColor={accentColor}
                  color={accentColor}
                  _hover={{
                    bg: `${accentColor}10`,
                    transform: "translateY(-4px)"
                  }}
                  onClick={onOpen}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  Assistant IA
                </Button>

                <Button
                  as={motion.button}
                  leftIcon={<FaGraduationCap />}
                  size="lg"
                  px={10}
                  py={7}
                  fontSize="lg"
                  variant="ghost"
                  color="gray.600"
                  _hover={{
                    bg: "gray.100",
                    transform: "translateY(-4px)"
                  }}
                  onClick={() => navigate("/profile")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  Mon Progrès
                </Button>
              </Stack>
            </SlideFade>

            {/* Statistiques */}
            <Fade in={true}>
              <SimpleGrid 
                columns={{ base: 2, md: 4 }} 
                spacing={8}
                width="100%"
                maxW="900px"
                mt={12}
              >
                {[
                  { value: "10K+", label: "Apprenants", icon: <FaUsers />, delay: 0 },
                  { value: "95%", label: "Réussite", icon: <FaCheckCircle />, delay: 0.1 },
                  { value: "500+", label: "Questions", icon: <FaBook />, delay: 0.2 },
                  { value: "24/7", label: "Support", icon: <FaBrain />, delay: 0.3 }
                ].map((stat, index) => (
                  <MotionBox
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: stat.delay }}
                  >
                    <Card
                      bg="white"
                      border="1px solid"
                      borderColor="gray.200"
                      borderRadius="2xl"
                      color="gray.800"
                      boxShadow="0 10px 30px rgba(0, 0, 0, 0.05)"
                      _hover={{
                        transform: "translateY(-4px)",
                        boxShadow: "0 20px 40px rgba(79, 70, 229, 0.1)"
                      }}
                      style={{ transition: "all 0.3s ease" }}
                    >
                      <CardBody p={6}>
                        <VStack spacing={4}>
                          <Center
                            w={14}
                            h={14}
                            borderRadius="xl"
                            bg={`${accentColor}10`}
                            color={accentColor}
                          >
                            <Icon as={FaUsers} boxSize={6} />
                          </Center>
                          <VStack spacing={1}>
                            <Heading size="xl" fontWeight="bold">
                              {stat.value}
                            </Heading>
                            <Text fontSize="sm" color="gray.600">
                              {stat.label}
                            </Text>
                          </VStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  </MotionBox>
                ))}
              </SimpleGrid>
            </Fade>
          </VStack>
        </Container>
      </Box>

      {/* Section Features - Transition vers SOMBRE */}
      <Box 
        bg={middleBgColor} 
        py={20}
        position="relative"
        _before={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "100px",
          background: `linear-gradient(to bottom, ${topBgColor}, ${middleBgColor})`,
          zIndex: 1
        }}
      >
        <Container maxW="7xl" position="relative" zIndex="2">
          <VStack spacing={20}>
            {/* Section titre */}
            <Box textAlign="center" maxW="3xl" mx="auto">
              <Badge
                bg={`${accentColor}15`}
                color={accentColor}
                px={4}
                py={1}
                borderRadius="full"
                fontSize="sm"
                mb={6}
              >
                Nos Atouts
              </Badge>
              <Heading size="2xl" mb={6} color={textColor}>
                Pourquoi nous choisir ?
              </Heading>
              <Text fontSize="xl" color={secondaryTextColor}>
                Une expérience d'apprentissage unique combinant technologie et pédagogie
              </Text>
            </Box>

            {/* Grid de features */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8} width="100%">
              {features.map((feature, index) => (
                <MotionBox
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card
                    bg={cardBg}
                    borderRadius="2xl"
                    boxShadow="0 10px 40px rgba(0, 0, 0, 0.08)"
                    border="1px solid"
                    borderColor={borderColor}
                    _hover={{
                      transform: "translateY(-8px)",
                      boxShadow: "0 20px 60px rgba(79, 70, 229, 0.15)",
                      borderColor: accentColor
                    }}
                    style={{ transition: "all 0.3s ease" }}
                    height="100%"
                  >
                    <CardBody p={8}>
                      <VStack spacing={6} align="start">
                        <Center
                          w={16}
                          h={16}
                          borderRadius="xl"
                          bg={`${feature.color}15`}
                          color={feature.color}
                          fontSize="2xl"
                        >
                          {feature.icon}
                        </Center>
                        <Box>
                          <Heading size="lg" mb={3} color={textColor}>
                            {feature.title}
                          </Heading>
                          <Text color={secondaryTextColor}>
                            {feature.description}
                          </Text>
                        </Box>
                      </VStack>
                    </CardBody>
                  </Card>
                </MotionBox>
              ))}
            </SimpleGrid>

            {/* Section Thèmes populaires */}
            <Box width="100%">
              <Heading size="xl" mb={10} textAlign="center" color={textColor}>
                Thèmes populaires
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {drivingTopics.map((topic, index) => (
                  <MotionBox
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card
                      bg={cardBg}
                      borderRadius="xl"
                      boxShadow="0 4px 20px rgba(0, 0, 0, 0.06)"
                      border="1px solid"
                      borderColor={borderColor}
                      _hover={{
                        transform: "translateY(-4px)",
                        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.12)"
                      }}
                      style={{ transition: "all 0.3s ease" }}
                    >
                      <CardBody p={6}>
                        <VStack spacing={4} align="start">
                          <HStack spacing={3}>
                            <Center
                              w={12}
                              h={12}
                              borderRadius="lg"
                              bg={`${topic.color}15`}
                              color={topic.color}
                              fontSize="xl"
                            >
                              {topic.icon}
                            </Center>
                            <Text fontWeight="bold" fontSize="lg" color={textColor}>
                              {topic.title}
                            </Text>
                          </HStack>
                          <VStack spacing={2} align="start" width="100%">
                            {topic.questions.map((question, qIndex) => (
                              <Button
                                key={qIndex}
                                variant="ghost"
                                size="sm"
                                justifyContent="flex-start"
                                fontSize="sm"
                                color={secondaryTextColor}
                                _hover={{
                                  color: accentColor,
                                  bg: `${accentColor}10`
                                }}
                                onClick={() => sendChatMessage(question)}
                                width="100%"
                                textAlign="left"
                                p={2}
                                style={{ transition: "all 0.2s ease" }}
                              >
                                {question}
                              </Button>
                            ))}
                          </VStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  </MotionBox>
                ))}
              </SimpleGrid>
            </Box>

            {/* CTA Section */}
            <Box
              bgGradient={accentGradient}
              color="white"
              borderRadius="2xl"
              p={{ base: 8, md: 12 }}
              textAlign="center"
              width="100%"
              position="relative"
              overflow="hidden"
            >
              <Box
                position="absolute"
                top="0"
                left="0"
                right="0"
                bottom="0"
                background="radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)"
              />
              
              <Container maxW="3xl" position="relative" zIndex="2">
                <VStack spacing={8}>
                  <Heading size="2xl">
                    Prêt à maîtriser le code de la route ?
                  </Heading>
                  <Text fontSize="xl" opacity={0.9}>
                    Rejoignez notre communauté et accédez à toutes les fonctionnalités gratuitement
                  </Text>
                  <Button
                    as={motion.button}
                    size="lg"
                    px={12}
                    py={7}
                    fontSize="lg"
                    bg="white"
                    color={accentColor}
                    _hover={{
                      bg: "white",
                      transform: "translateY(-4px)",
                      boxShadow: "0 20px 40px rgba(255, 255, 255, 0.2)"
                    }}
                    onClick={() => navigate("/quiz")}
                    rightIcon={<FaArrowRight />}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    Commencer maintenant
                  </Button>
                </VStack>
              </Container>
            </Box>
          </VStack>
        </Container>
      </Box>

      {/* Floating AI Assistant Button */}
      <Box
        as={motion.div}
        position="fixed"
        bottom="30px"
        right="30px"
        zIndex="1000"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.2 }}
      >
        <Tooltip label="Assistant IA Expert" placement="left" hasArrow>
          <IconButton
            icon={<FaRobot />}
            aria-label="AI Assistant"
            size="lg"
            isRound
            bgGradient={accentGradient}
            color="white"
            boxShadow="0 10px 30px rgba(79, 70, 229, 0.4)"
            _hover={{
              bgGradient: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
              boxShadow: "0 15px 40px rgba(79, 70, 229, 0.6)"
            }}
            fontSize="24px"
            onClick={onOpen}
          />
        </Tooltip>
      </Box>

      {/* AI Chat Drawer */}
      <Drawer 
        isOpen={isOpen} 
        onClose={onClose} 
        placement="right" 
        size="md"
      >
        <DrawerOverlay backdropFilter="blur(4px)" bg="blackAlpha.600" />
        <DrawerContent 
          borderRadius="lg" 
          overflow="hidden"
          bg={cardBg}
          boxShadow="2xl"
        >
          <DrawerHeader 
            bgGradient={accentGradient}
            color="white"
            py={6}
          >
            <Flex alignItems="center" justifyContent="space-between">
              <HStack spacing={3}>
                <Center w={12} h={12} borderRadius="lg" bg="whiteAlpha.200">
                  <Icon as={FaRobot} boxSize={6} />
                </Center>
                <VStack align="start" spacing={1}>
                  <Text fontSize="lg" fontWeight="bold">Assistant IA</Text>
                  <Text fontSize="xs" opacity={0.9}>Expert en code de la route</Text>
                </VStack>
              </HStack>
              <HStack>
                <AnimatePresence>
                  {chatHistory.length > 1 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <Button
                        size="sm" 
                        variant="ghost" 
                        color="white" 
                        onClick={clearChat} 
                        leftIcon={<FaTimes />}
                        _hover={{ bg: "whiteAlpha.200" }}
                      >
                        Effacer
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
                <DrawerCloseButton position="relative" color="white" />
              </HStack>
            </Flex>
          </DrawerHeader>

          <DrawerBody p={0} display="flex" flexDirection="column">
            {/* Chat Area */}
            <Box 
              ref={chatRef}
              flex="1" 
              p={4} 
              overflowY="auto" 
              maxH="60vh"
              minH="300px"
              bg={useColorModeValue("gray.50", "gray.900")}
            >
              <AnimatePresence>
                {chatHistory.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Box mb={4}>
                      <Flex alignItems="flex-start" gap={3}>
                        {message.type === "ai" && (
                          <Avatar 
                            size="sm" 
                            icon={<FaRobot />}
                            bgGradient={accentGradient}
                            color="white"
                          />
                        )}
                        <Box
                          bg={message.type === "user" 
                            ? accentGradient 
                            : "white"}
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
                          {message.type === "ai" && message.source !== "welcome" && (
                            <Text fontSize="xs" color={secondaryTextColor} mt={2}>
                              <Flex alignItems="center" gap={1}>
                                <Icon as={FaBrain} boxSize={3} />
                                {message.source}
                              </Flex>
                            </Text>
                          )}
                        </Box>
                        {message.type === "user" && (
                          <Avatar 
                            size="sm" 
                            name={userInfo.name || "User"}
                            bg={accentColor}
                            color="white"
                          />
                        )}
                      </Flex>
                    </Box>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isChatLoading && (
                <Flex alignItems="center" gap={3} p={3} bg="white" borderRadius="lg" shadow="sm">
                  <Spinner size="sm" color={accentColor} />
                  <Text color="gray.500" fontSize="sm">L'IA réfléchit...</Text>
                </Flex>
              )}
            </Box>

            {/* Suggestions rapides */}
            <Box p={4} borderTopWidth="1px" borderColor={borderColor} bg={cardBg}>
              <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={3}>
                Questions rapides :
              </Text>
              <SimpleGrid columns={2} spacing={2}>
                {quickSuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    as={motion.button}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    size="xs"
                    variant="outline"
                    onClick={() => sendChatMessage(suggestion.text)}
                    leftIcon={suggestion.icon}
                    justifyContent="flex-start"
                    fontSize="xs"
                    py={2}
                    height="auto"
                    whiteSpace="normal"
                    textAlign="left"
                    color={secondaryTextColor}
                    borderColor={borderColor}
                    _hover={{ 
                      bg: `${accentColor}10`, 
                      borderColor: accentColor,
                      color: accentColor 
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {suggestion.text}
                  </Button>
                ))}
              </SimpleGrid>
            </Box>

            {/* Input Area */}
            <Box p={4} borderTopWidth="1px" borderColor={borderColor} bg={cardBg}>
              {aiError && (
                <Alert status="error" mb={3} borderRadius="md" size="sm">
                  <AlertIcon />
                  <Text fontSize="xs">{aiError}</Text>
                </Alert>
              )}
              
              <VStack spacing={3}>
                <Textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Posez votre question sur le code de la route..."
                  size="sm"
                  rows={2}
                  resize="vertical"
                  isDisabled={isChatLoading}
                  focusBorderColor={accentColor}
                  borderColor={borderColor}
                  _hover={{ borderColor: accentColor }}
                  bg={useColorModeValue("white", "gray.700")}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendChatMessage();
                    }
                  }}
                />
                
                <Flex width="100%" justifyContent="space-between" alignItems="center">
                  <HStack spacing={2}>
                    <Text fontSize="xs" color={secondaryTextColor}>
                      Assistant IA spécialisé
                    </Text>
                  </HStack>
                  
                  <Button
                    bgGradient={accentGradient}
                    color="white"
                    onClick={() => sendChatMessage()}
                    isLoading={isChatLoading}
                    loadingText="Envoi..."
                    rightIcon={<FaPaperPlane />}
                    isDisabled={!chatInput.trim() || isChatLoading}
                    size="sm"
                    _hover={{
                      bgGradient: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
                      transform: "translateY(-1px)"
                    }}
                    _active={{ transform: "translateY(0)" }}
                    transition="all 0.2s"
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

export default Mainpage;