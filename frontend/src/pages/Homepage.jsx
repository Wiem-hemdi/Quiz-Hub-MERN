import React, { useEffect } from "react";
import {
  Container, Box, Text, Tab, Tabs, TabList, TabPanels, TabPanel,
  Stack, VStack, HStack, Heading, Flex, Avatar, Card, CardBody,
  useColorModeValue, Icon, SimpleGrid, Button, Badge, Divider,
  ScaleFade, Fade, useBreakpointValue, Image
} from "@chakra-ui/react";
import Login from "../components/authentication/Login";
import Signup from "../components/authentication/Signup";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaCar, FaRoad, FaGraduationCap, FaTrophy, FaUsers,
  FaChartLine, FaShieldAlt, FaBrain, FaRocket, FaAward,
  FaLock, FaUserPlus, FaCheckCircle, FaArrowRight,
  FaStar, FaLightbulb, FaMobileAlt, FaClock
} from "react-icons/fa";
import { GiLaurelsTrophy, GiSteeringWheel, GiRoad } from "react-icons/gi";
import { MdSecurity, MdTrendingUp } from "react-icons/md";

const MotionBox = motion(Box);

const Homepage = () => {
  const navigate = useNavigate();
  const isMobile = useBreakpointValue({ base: true, lg: false });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (user) navigate("/main");
  }, [navigate]);

  // Nouvelle palette de couleurs améliorée
  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
  );
  
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const secondaryTextColor = useColorModeValue("gray.600", "gray.300");
  const accentColor = useColorModeValue("#4f46e5", "#818cf8");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const highlightGradient = "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)";

  const features = [
    { 
      icon: FaBrain, 
      title: "Assistant IA Expert", 
      description: "Explications personnalisées",
      color: "#3b82f6"
    },
    { 
      icon: FaShieldAlt, 
      title: "Apprentissage Sécurisé", 
      description: "Environnement contrôlé",
      color: "#10b981"
    },
    { 
      icon: FaTrophy, 
      title: "Système de Récompenses", 
      description: "Motivation continue",
      color: "#f59e0b"
    },
    { 
      icon: FaChartLine, 
      title: "Suivi Détaillé", 
      description: "Progression visualisée",
      color: "#8b5cf6"
    },
  ];

  const benefits = [
    "Assistant IA 24/7",
    "Suivi de progression détaillé",
    "Badges et récompenses",
    "Classement communautaire",
    "Questions actualisées",
    "Support personnalisé"
  ];

  return (
    <Box minH="100vh" bg={bgGradient} position="relative" overflow="hidden">
      {/* Effets décoratifs subtils */}
      <Box
        position="absolute"
        top="-10%"
        right="-10%"
        w="500px"
        h="500px"
        borderRadius="full"
        bg="linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)"
        filter="blur(60px)"
        zIndex="1"
      />
      
      <Box
        position="absolute"
        bottom="-10%"
        left="-10%"
        w="400px"
        h="400px"
        borderRadius="full"
        bg="linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)"
        filter="blur(60px)"
        zIndex="1"
      />

      <Container maxW="7xl" position="relative" zIndex="2">
        <Flex
          minH="100vh"
          alignItems="center"
          justifyContent={{ base: "center", lg: "space-between" }}
          gap={8}
          py={8}
          px={{ base: 4, md: 8 }}
        >
          {/* Section gauche - Présentation */}
          <MotionBox
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            flex="1"
            display={{ base: "none", lg: "block" }}
            pr={12}
          >
            <VStack align="start" spacing={10}>
              {/* Logo et titre */}
              <VStack align="start" spacing={6}>
                <HStack spacing={4}>
                  <Box
                    p={4}
                    bg="white"
                    borderRadius="2xl"
                    boxShadow="0 10px 40px rgba(79, 70, 229, 0.15)"
                    position="relative"
                  >
                    <Icon as={GiSteeringWheel} boxSize={8} color={accentColor} />
                    <Box
                      position="absolute"
                      top="-2"
                      right="-2"
                      w="4"
                      h="4"
                      bg="green.400"
                      borderRadius="full"
                      borderWidth="2px"
                      borderColor="white"
                    />
                  </Box>
                  <VStack align="start" spacing={2}>
                    <Heading 
                      size="2xl" 
                      fontWeight="800"
                      bgGradient={highlightGradient}
                      bgClip="text"
                    >
                      Highway Quiz
                    </Heading>
                    <Text 
                      fontSize="xl" 
                      color={secondaryTextColor}
                      fontWeight="500"
                    >
                      Maîtrisez le code de la route avec intelligence
                    </Text>
                  </VStack>
                </HStack>
              </VStack>

              {/* Points forts */}
              <VStack align="start" spacing={6}>
                <Heading size="lg" color={textColor}>
                  🎯 L'excellence en 4 points
                </Heading>
                <SimpleGrid columns={2} spacing={4}>
                  {features.map((feature, index) => (
                    <MotionBox
                      key={index}
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card
                        bg={cardBg}
                        borderRadius="xl"
                        boxShadow="0 4px 20px rgba(0, 0, 0, 0.08)"
                        border="1px solid"
                        borderColor={borderColor}
                        _hover={{
                          transform: 'translateY(-5px)',
                          boxShadow: '0 20px 40px rgba(79, 70, 229, 0.15)'
                        }}
                        transition="all 0.3s"
                      >
                        <CardBody p={5}>
                          <VStack spacing={3} align="start">
                            <Box
                              p={3}
                              bg={`${feature.color}10`}
                              borderRadius="lg"
                            >
                              <Icon 
                                as={feature.icon} 
                                color={feature.color} 
                                boxSize={6} 
                              />
                            </Box>
                            <Text 
                              fontWeight="600" 
                              color={textColor}
                              fontSize="md"
                            >
                              {feature.title}
                            </Text>
                            <Text 
                              fontSize="sm" 
                              color={secondaryTextColor}
                            >
                              {feature.description}
                            </Text>
                          </VStack>
                        </CardBody>
                      </Card>
                    </MotionBox>
                  ))}
                </SimpleGrid>
              </VStack>

              {/* Statistiques */}
              <Card 
                bg={cardBg}
                borderRadius="2xl"
                boxShadow="0 10px 40px rgba(0, 0, 0, 0.1)"
                border="1px solid"
                borderColor={borderColor}
                w="100%"
              >
                <CardBody>
                  <SimpleGrid columns={3} spacing={4}>
                    {[
                      { value: "10K+", label: "Apprenants", icon: FaUsers },
                      { value: "95%", label: "Réussite", icon: FaStar },
                      { value: "24/7", label: "Disponible", icon: FaClock }
                    ].map((stat, index) => (
                      <VStack key={index} spacing={2}>
                        <HStack spacing={2}>
                          <Icon 
                            as={stat.icon} 
                            color={accentColor} 
                            boxSize={5} 
                          />
                          <Text 
                            fontSize="2xl" 
                            fontWeight="800"
                            bgGradient={highlightGradient}
                            bgClip="text"
                          >
                            {stat.value}
                          </Text>
                        </HStack>
                        <Text 
                          fontSize="sm" 
                          color={secondaryTextColor}
                          fontWeight="500"
                        >
                          {stat.label}
                        </Text>
                      </VStack>
                    ))}
                  </SimpleGrid>
                </CardBody>
              </Card>

              {/* Témoignage */}
              <MotionBox
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Card
                  bg={cardBg}
                  borderRadius="2xl"
                  boxShadow="0 10px 40px rgba(0, 0, 0, 0.1)"
                  border="1px solid"
                  borderColor={borderColor}
                  position="relative"
                  overflow="hidden"
                >
                  <Box
                    position="absolute"
                    top="0"
                    left="0"
                    w="4px"
                    h="full"
                    bgGradient={highlightGradient}
                  />
                  <CardBody p={6}>
                    <VStack spacing={4} align="start">
                      <HStack spacing={3}>
                        <Avatar 
                          size="md" 
                          name="Wiem H." 
                          src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"
                        />
                        <Box>
                          <Text fontWeight="700" color={textColor}>
                            Wiem H.
                          </Text>
                          <Text fontSize="sm" color={secondaryTextColor}>
                            Étudiante en IA
                          </Text>
                        </Box>
                      </HStack>
                      <Text 
                        fontStyle="italic" 
                        color={secondaryTextColor}
                        fontSize="lg"
                      >
                        "La plateforme m'a tellement bien préparée que j'ai obtenu mon permis avec seulement 2 fautes !"
                      </Text>
                      <HStack spacing={2}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Icon key={star} as={FaStar} color="yellow.400" />
                        ))}
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </MotionBox>
            </VStack>
          </MotionBox>

          {/* Section droite - Formulaire */}
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            flex="1"
            maxW={{ base: "100%", lg: "480px" }}
            w="100%"
          >
            <Card
              bg={cardBg}
              borderRadius="2xl"
              boxShadow="0 25px 50px -12px rgba(79, 70, 229, 0.25)"
              border="1px solid"
              borderColor={borderColor}
              overflow="hidden"
              position="relative"
            >
              {/* Ruban décoratif */}
              <Box
                position="absolute"
                top="0"
                left="0"
                right="0"
                h="6px"
                bgGradient={highlightGradient}
              />
              
              {/* Header de la carte */}
              <Box
                bg="white"
                borderBottom="1px solid"
                borderColor={borderColor}
                py={10}
                px={8}
                textAlign="center"
              >
                <VStack spacing={5}>
                  <Box
                    p={4}
                    bgGradient={highlightGradient}
                    borderRadius="xl"
                    display="inline-block"
                    boxShadow="0 10px 30px rgba(79, 70, 229, 0.3)"
                  >
                    <Icon as={GiLaurelsTrophy} boxSize={8} color="white" />
                  </Box>
                  <VStack spacing={2}>
                    <Heading 
                      size="xl" 
                      fontWeight="800"
                      color={textColor}
                    >
                      Commencez votre route
                    </Heading>
                    <Text 
                      color={secondaryTextColor}
                      fontSize="md"
                    >
                      Accédez à la meilleure préparation au code
                    </Text>
                  </VStack>
                </VStack>
              </Box>

              <CardBody p={8}>
                <Tabs variant="soft-rounded" colorScheme="purple" isFitted>
                  <TabList 
                    mb={8} 
                    p={1}
                    bg="gray.100"
                    borderRadius="xl"
                    border="1px solid"
                    borderColor={borderColor}
                  >
                    <Tab 
                      py={4}
                      fontSize="md"
                      fontWeight="600"
                      borderRadius="lg"
                      _selected={{
                        bg: "white",
                        color: accentColor,
                        boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)"
                      }}
                    >
                      <HStack spacing={3}>
                        <Icon as={FaLock} />
                        <Text>Connexion</Text>
                      </HStack>
                    </Tab>
                    <Tab 
                      py={4}
                      fontSize="md"
                      fontWeight="600"
                      borderRadius="lg"
                      _selected={{
                        bg: "white",
                        color: accentColor,
                        boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)"
                      }}
                    >
                      <HStack spacing={3}>
                        <Icon as={FaUserPlus} />
                        <Text>Inscription</Text>
                      </HStack>
                    </Tab>
                  </TabList>

                  <TabPanels>
                    <TabPanel p={0}>
                      <ScaleFade in={true}>
                        <Box px={1}>
                          <Login />
                        </Box>
                      </ScaleFade>
                    </TabPanel>
                    <TabPanel p={0}>
                      <ScaleFade in={true}>
                        <Box px={1}>
                          <Signup />
                        </Box>
                      </ScaleFade>
                    </TabPanel>
                  </TabPanels>
                </Tabs>

                <Divider my={8} borderColor={borderColor} />

                {/* Avantages */}
                <VStack spacing={4} align="start">
                  <Heading size="sm" color={textColor}>
                    ✨ Ce qui vous attend :
                  </Heading>
                  <SimpleGrid columns={2} spacing={3}>
                    {benefits.map((item, index) => (
                      <HStack key={index} spacing={3}>
                        <Box
                          p={1.5}
                          bg="green.50"
                          borderRadius="md"
                          border="1px solid"
                          borderColor="green.100"
                        >
                          <Icon 
                            as={FaCheckCircle} 
                            color="green.500" 
                            boxSize={3} 
                          />
                        </Box>
                        <Text 
                          fontSize="sm" 
                          color={secondaryTextColor}
                          fontWeight="500"
                        >
                          {item}
                        </Text>
                      </HStack>
                    ))}
                  </SimpleGrid>
                </VStack>
              </CardBody>
            </Card>

            {/* Info copyright */}
            <Text
              mt={6}
              textAlign="center"
              fontSize="sm"
              color={secondaryTextColor}
              opacity="0.8"
            >
              © 2024 Highway Quiz Academy. Conçu avec passion pour votre réussite.
            </Text>
          </MotionBox>
        </Flex>
      </Container>

      {/* Version mobile - Présentation simplifiée */}
      {isMobile && (
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          bg={cardBg}
          mx={4}
          mt={4}
          borderRadius="2xl"
          boxShadow="0 10px 40px rgba(0, 0, 0, 0.1)"
          p={6}
        >
          <VStack spacing={6} textAlign="center">
            <Box
              p={4}
              bgGradient={highlightGradient}
              borderRadius="xl"
              display="inline-block"
            >
              <Icon as={GiSteeringWheel} boxSize={10} color="white" />
            </Box>
            <VStack spacing={2}>
              <Heading 
                size="xl" 
                fontWeight="800"
                bgGradient={highlightGradient}
                bgClip="text"
              >
                Highway Quiz
              </Heading>
              <Text 
                color={secondaryTextColor}
                fontSize="lg"
                fontWeight="500"
              >
                Votre succès commence ici
              </Text>
            </VStack>
            
            <SimpleGrid columns={2} spacing={3} w="full">
              {features.slice(0, 4).map((feature, index) => (
                <HStack key={index} spacing={2}>
                  <Icon as={feature.icon} color={feature.color} />
                  <Text fontSize="sm" fontWeight="500">{feature.title}</Text>
                </HStack>
              ))}
            </SimpleGrid>
          </VStack>
        </MotionBox>
      )}
    </Box>
  );
};

export default Homepage;