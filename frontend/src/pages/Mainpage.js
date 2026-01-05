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
  ModalBody, ModalFooter, ModalCloseButton,Center 
} from "@chakra-ui/react";
import axios from "axios";
import Navbar from "../components/others/navbar";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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
  FaCaretUp, FaMedal, FaLanguage
} from "react-icons/fa";
import { GiSteeringWheel, GiRoad, GiStopSign, GiLaurelsTrophy } from "react-icons/gi";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

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

  // Thème couleurs
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const accentColor = useColorModeValue("purple.600", "purple.300");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const gradient = useColorModeValue(
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #4c51bf 0%, #6b46c1 100%)"
  );

  const drivingTopics = [
    {
      icon: <FaTrafficLight />,
      title: "Feux de signalisation",
      questions: [
        "Que signifie un feu orange ?",
        "Que faire au feu rouge ?",
        "Peut-on tourner à droite au feu rouge ?"
      ]
    },
    {
      icon: <GiStopSign />,
      title: "Panneaux",
      questions: [
        "Que signifie le panneau STOP ?",
        "Comment reconnaître un panneau de priorité ?",
        "Que faire devant un panneau 'Cédez le passage' ?"
      ]
    },
    {
      icon: <FaRoad />,
      title: "Vitesse & Distance",
      questions: [
        "Quelle est la vitesse en ville ?",
        "Comment calculer la distance de sécurité ?",
        "Vitesse par temps de pluie ?"
      ]
    },
    {
      icon: <GiSteeringWheel />,
      title: "Manœuvres",
      questions: [
        "Comment prendre un rond-point ?",
        "Quand peut-on dépasser ?",
        "Comment faire un créneau ?"
      ]
    }
  ];

  const quickSuggestions = [
    "Qu'est-ce qu'un feu orange ?",
    "Quelle est la vitesse en ville ?",
    "Comment fonctionne un rond-point ?",
    "Quand faut-il utiliser la ceinture ?",
    "Peut-on téléphoner en conduisant ?",
    "Que signifie le panneau STOP ?",
    "Distance de sécurité minimale ?",
    "Alcool au volant : quelle limite ?"
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

  const testAIConnection = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/ai/test", {
        timeout: 5000
      });
      alert(`✅ AI System Status:\n\nBackend: ${response.data.status}\nModel: ${response.data.model}`);
    } catch (error) {
      alert(`❌ AI Test Failed:\n${error.message}`);
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
      
      {/* Hero Section */}
      <Box
        minH="100vh"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        bg={gradient}
        color="white"
        w="100%"
        p={4}
        position="relative"
        overflow="hidden"
      >
        {/* Effets décoratifs */}
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
          <VStack spacing={8}>
            {/* Titre principal */}
            <MotionBox
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Heading
                as="h1"
                fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }}
                mb={4}
                mt={36}
                fontWeight="extrabold"
              >
                🚗 Highway Quiz Academy
              </Heading>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Text
                fontSize={{ base: "xl", md: "2xl", lg: "3xl" }}
                mb={8}
                opacity="0.9"
                maxW="800px"
                fontWeight="medium"
              >
                Maîtrisez le code de la route avec notre plateforme interactive et notre assistant IA expert
              </Text>
            </MotionBox>

            {/* CTA Buttons */}
            <MotionBox
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <HStack spacing={6} mt={8} flexWrap="wrap" justify="center">
                <Button
                  colorScheme="whiteAlpha"
                  size="lg"
                  px={8}
                  py={6}
                  fontSize="lg"
                  onClick={() => navigate("/quiz")}
                  leftIcon={<FaCar />}
                  _hover={{
                    bg: "whiteAlpha.200",
                    transform: "translateY(-2px)",
                    boxShadow: "xl"
                  }}
                  transition="all 0.3s"
                  border="2px solid"
                  borderColor="whiteAlpha.400"
                >
                  Commencer un Quiz
                </Button>

                <Button
                  colorScheme="whiteAlpha"
                  size="lg"
                  px={8}
                  py={6}
                  fontSize="lg"
                  onClick={onOpen}
                  leftIcon={<FaRobot />}
                  variant="outline"
                  borderWidth="2px"
                  borderColor="white"
                  _hover={{
                    bg: "whiteAlpha.200",
                    transform: "translateY(-2px)"
                  }}
                  transition="all 0.3s"
                >
                  Assistant IA
                </Button>

                <Button
                  colorScheme="whiteAlpha"
                  size="lg"
                  px={8}
                  py={6}
                  fontSize="lg"
                  onClick={() => navigate("/leaderboard")}
                  leftIcon={<FaTrophy />}
                  variant="ghost"
                  _hover={{
                    bg: "whiteAlpha.200",
                    transform: "translateY(-2px)"
                  }}
                  transition="all 0.3s"
                >
                  Voir le Classement
                </Button>
              </HStack>
            </MotionBox>

            {/* Statistiques */}
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <SimpleGrid 
                columns={{ base: 2, md: 4 }} 
                spacing={6} 
                mt={12}
                width="100%"
                maxW="800px"
              >
                <StatCard 
                  icon={<FaUsers />}
                  value="10,000+"
                  label="Conducteurs formés"
                  color="blue"
                />
                <StatCard 
                  icon={<FaGraduationCap />}
                  value="95%"
                  label="Taux de réussite"
                  color="green"
                />
                <StatCard 
                  icon={<FaTrophy />}
                  value="500+"
                  label="Questions disponibles"
                  color="yellow"
                />
                <StatCard 
                  icon={<FaChartLine />}
                  value="24/7"
                  label="Support IA"
                  color="purple"
                />
              </SimpleGrid>
            </MotionBox>

            {/* Features Cards */}
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <SimpleGrid 
                columns={{ base: 1, md: 3 }} 
                spacing={6} 
                mt={12}
                width="100%"
                maxW="900px"
              >
                <FeatureCard
                  icon={<FaBrain />}
                  title="Assistant IA Expert"
                  description="Obtenez des explications détaillées et personnalisées sur toutes les règles de conduite"
                />
                <FeatureCard
                  icon={<FaShieldAlt />}
                  title="Apprentissage Sécurisé"
                  description="Pratiquez dans un environnement sans risque avant de prendre la route"
                />
                <FeatureCard
                  icon={<FaRocket />}
                  title="Progression Rapide"
                  description="Suivez vos progrès et améliorez vos compétences rapidement"
                />
              </SimpleGrid>
            </MotionBox>
          </VStack>
        </Container>
      </Box>

      {/* Contenu principal */}
      <Box bg={bgColor} py={20}>
        <Container maxW="7xl">
          <VStack spacing={16}>
            {/* Section Pourquoi choisir */}
            <Box textAlign="center">
              <Heading size="2xl" mb={6} color={textColor}>
                Pourquoi choisir Highway Quiz ?
              </Heading>
              <Text fontSize="xl" color="gray.600" maxW="3xl" mx="auto">
                Une plateforme complète pour maîtriser le code de la route avec des outils modernes et efficaces
              </Text>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8} width="100%">
              <MotionCard
                whileHover={{ y: -10 }}
                bg={cardBg}
                borderRadius="2xl"
                boxShadow="lg"
              >
                <CardBody textAlign="center">
                  <Center w={16} h={16} mx="auto" mb={6} borderRadius="xl" bg="blue.100">
                    <Icon as={FaRobot} boxSize={8} color="blue.500" />
                  </Center>
                  <Heading size="md" mb={4} color={textColor}>
                    IA Intelligente
                  </Heading>
                  <Text color="gray.600">
                    Assistant IA disponible 24/7 pour répondre à toutes vos questions
                  </Text>
                </CardBody>
              </MotionCard>

              <MotionCard
                whileHover={{ y: -10 }}
                bg={cardBg}
                borderRadius="2xl"
                boxShadow="lg"
              >
                <CardBody textAlign="center">
                  <Center w={16} h={16} mx="auto" mb={6} borderRadius="xl" bg="green.100">
                    <Icon as={FaGraduationCap} boxSize={8} color="green.500" />
                  </Center>
                  <Heading size="md" mb={4} color={textColor}>
                    Apprentissage Adaptatif
                  </Heading>
                  <Text color="gray.600">
                    Questions adaptées à votre niveau et à vos progrès
                  </Text>
                </CardBody>
              </MotionCard>

              <MotionCard
                whileHover={{ y: -10 }}
                bg={cardBg}
                borderRadius="2xl"
                boxShadow="lg"
              >
                <CardBody textAlign="center">
                  <Center w={16} h={16} mx="auto" mb={6} borderRadius="xl" bg="purple.100">
                    <Icon as={FaTrophy} boxSize={8} color="purple.500" />
                  </Center>
                  <Heading size="md" mb={4} color={textColor}>
                    Système de Récompenses
                  </Heading>
                  <Text color="gray.600">
                    Badges, XP et classement pour vous motiver
                  </Text>
                </CardBody>
              </MotionCard>

              <MotionCard
                whileHover={{ y: -10 }}
                bg={cardBg}
                borderRadius="2xl"
                boxShadow="lg"
              >
                <CardBody textAlign="center">
                  <Center w={16} h={16} mx="auto" mb={6} borderRadius="xl" bg="orange.100">
                    <Icon as={FaChartLine} boxSize={8} color="orange.500" />
                  </Center>
                  <Heading size="md" mb={4} color={textColor}>
                    Suivi Détaillé
                  </Heading>
                  <Text color="gray.600">
                    Statistiques et graphiques pour analyser vos progrès
                  </Text>
                </CardBody>
              </MotionCard>
            </SimpleGrid>

            {/* Section Commencer */}
            <Box 
              bg={gradient}
              color="white"
              borderRadius="2xl"
              p={12}
              textAlign="center"
              width="100%"
            >
              <Heading size="xl" mb={6}>
                Prêt à devenir un expert du code de la route ?
              </Heading>
              <Text fontSize="lg" mb={8} opacity={0.9}>
                Rejoignez des milliers d'utilisateurs qui ont déjà amélioré leurs compétences
              </Text>
              <Button
                size="lg"
                px={12}
                py={6}
                fontSize="lg"
                colorScheme="whiteAlpha"
                borderWidth="2px"
                onClick={() => navigate("/quiz")}
                rightIcon={<FaArrowRight />}
                _hover={{
                  bg: "whiteAlpha.200",
                  transform: "translateY(-2px)"
                }}
                transition="all 0.3s"
              >
                Commencer gratuitement
              </Button>
            </Box>
          </VStack>
        </Container>
      </Box>

      {/* Floating AI Assistant Button */}
      <Tooltip label="Assistant IA" placement="left" hasArrow>
        <IconButton
          icon={<FaRobot />}
          colorScheme="blue"
          size="lg"
          isRound
          position="fixed"
          bottom="30px"
          right="30px"
          zIndex="1000"
          onClick={onOpen}
          boxShadow="0 10px 25px rgba(66, 153, 225, 0.5)"
          aria-label="AI Assistant"
          fontSize="24px"
          bgGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          color="white"
          _hover={{
            bgGradient: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
            transform: "scale(1.1)",
            boxShadow: "0 15px 30px rgba(102, 126, 234, 0.6)"
          }}
          transition="all 0.3s"
        />
      </Tooltip>

      {/* AI Chat Drawer */}
      <Drawer 
        isOpen={isOpen} 
        onClose={onClose} 
        placement="right" 
        size="md"
      >
        <DrawerOverlay backdropFilter="blur(4px)" />
        <DrawerContent 
          borderRadius="lg" 
          overflow="hidden"
          bg={cardBg}
          boxShadow="2xl"
        >
          <DrawerHeader 
            bgGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            color="white"
            py={6}
          >
            <Flex alignItems="center" justifyContent="space-between">
              <HStack spacing={3}>
                <Center w={10} h={10} borderRadius="lg" bg="whiteAlpha.200">
                  <Icon as={FaRobot} />
                </Center>
                <VStack align="start" spacing={0}>
                  <Text fontSize="lg" fontWeight="bold">Assistant Conduite IA</Text>
                  <Text fontSize="xs" opacity={0.9}>Expert en code de la route</Text>
                </VStack>
              </HStack>
              <HStack>
                {chatHistory.length > 1 && (
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
                )}
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
              {chatHistory.map((message) => (
                <Box 
                  key={message.id} 
                  mb={4}
                  alignSelf={message.type === "user" ? "flex-end" : "flex-start"}
                  maxW="85%"
                >
                  <Flex alignItems="flex-start" gap={3}>
                    {message.type === "ai" && (
                      <Avatar 
                        size="sm" 
                        icon={<FaRobot />}
                        bgGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        color="white"
                      />
                    )}
                    <Box
                      bg={message.type === "user" 
                        ? gradient 
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
                        <Text fontSize="xs" color="gray.500" mt={2}>
                          <Flex alignItems="center" gap={1}>
                            <Icon as={FaBrain} boxSize={3} />
                            {message.source} • {message.model}
                          </Flex>
                        </Text>
                      )}
                    </Box>
                    {message.type === "user" && (
                      <Avatar 
                        size="sm" 
                        name={userInfo.name || "User"}
                        bg="purple.500"
                        color="white"
                      />
                    )}
                  </Flex>
                </Box>
              ))}
              
              {isChatLoading && (
                <Flex alignItems="center" gap={3} p={3} bg="white" borderRadius="lg" shadow="sm">
                  <Spinner size="sm" color="blue.500" />
                  <Text color="gray.500" fontSize="sm">L'IA réfléchit...</Text>
                </Flex>
              )}
            </Box>

            {/* Topics Suggestions */}
            <Box p={4} borderTopWidth="1px" borderColor={borderColor} bg="white">
              <Text fontSize="sm" fontWeight="bold" color={textColor} mb={3}>
                Thèmes populaires :
              </Text>
              <SimpleGrid columns={2} spacing={2}>
                {drivingTopics.map((topic, index) => (
                  <Button
                    key={index}
                    size="xs"
                    variant="outline"
                    onClick={() => sendChatMessage(topic.questions[0])}
                    leftIcon={topic.icon}
                    justifyContent="flex-start"
                    fontSize="xs"
                    py={2}
                    height="auto"
                    whiteSpace="normal"
                    textAlign="left"
                    _hover={{ bg: "blue.50", borderColor: "blue.200" }}
                  >
                    {topic.title}
                  </Button>
                ))}
              </SimpleGrid>
            </Box>

            {/* Input Area */}
            <Box p={4} borderTopWidth="1px" borderColor={borderColor} bg="white">
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
                  placeholder="Posez votre question sur la conduite..."
                  size="sm"
                  rows={2}
                  resize="vertical"
                  isDisabled={isChatLoading}
                  focusBorderColor="blue.500"
                  borderColor={borderColor}
                  _hover={{ borderColor: "blue.300" }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendChatMessage();
                    }
                  }}
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
                    onClick={() => sendChatMessage()}
                    isLoading={isChatLoading}
                    loadingText="Envoi..."
                    rightIcon={<FaPaperPlane />}
                    isDisabled={!chatInput.trim() || isChatLoading}
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

// Composants Helper
const StatCard = ({ icon, value, label, color }) => (
  <MotionCard
    whileHover={{ scale: 1.05 }}
    bg="whiteAlpha.200"
    backdropFilter="blur(10px)"
    borderWidth="1px"
    borderColor="whiteAlpha.300"
    borderRadius="xl"
    color="white"
  >
    <CardBody textAlign="center" p={6}>
      <Box 
        display="inline-block" 
        p={4} 
        bg={`${color}.500`}
        borderRadius="lg" 
        mb={4}
      >
        <Box color="white" fontSize="2xl">
          {icon}
        </Box>
      </Box>
      <Stat>
        <StatNumber fontSize="3xl" fontWeight="bold" mb={1}>
          {value}
        </StatNumber>
        <StatLabel opacity={0.9} fontSize="sm">{label}</StatLabel>
      </Stat>
    </CardBody>
  </MotionCard>
);

const FeatureCard = ({ icon, title, description }) => (
  <MotionCard
    whileHover={{ y: -10 }}
    bg={useColorModeValue("white", "gray.800")}
    borderRadius="2xl"
    boxShadow="xl"
    borderWidth="1px"
    borderColor={useColorModeValue("gray.200", "gray.700")}
  >
    <CardBody textAlign="center" p={8}>
      <Center 
        w={16} 
        h={16} 
        mx="auto" 
        mb={6} 
        borderRadius="xl" 
        bgGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        color="white"
        fontSize="2xl"
      >
        {icon}
      </Center>
      <Heading size="lg" mb={4} color={useColorModeValue("gray.800", "white")}>
        {title}
      </Heading>
      <Text color={useColorModeValue("gray.600", "gray.400")} fontSize="md">
        {description}
      </Text>
    </CardBody>
  </MotionCard>
);

export default Mainpage;