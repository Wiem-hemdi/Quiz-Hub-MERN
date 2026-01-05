import React, { useEffect } from "react";
import {
  Container, Box, Text, Tab, Tabs, TabList, TabPanels, TabPanel,
  Stack, VStack, HStack, Heading, Flex, Avatar, Card, CardBody,
  useColorModeValue, Icon, SimpleGrid, Button, Badge, Divider,
  ScaleFade, Fade
} from "@chakra-ui/react";
import Login from "../components/authentication/Login";
import Signup from "../components/authentication/Signup";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaCar, FaRoad, FaGraduationCap, FaTrophy, FaUsers,
  FaChartLine, FaShieldAlt, FaBrain, FaRocket, FaAward,
  FaLock, FaUserPlus, FaCheckCircle, FaArrowRight
} from "react-icons/fa";
import { GiLaurelsTrophy, GiSteeringWheel } from "react-icons/gi";

const MotionBox = motion(Box);

const Homepage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (user) navigate("/main");
  }, [navigate]);

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

  const features = [
    { icon: FaBrain, title: "Assistant IA Expert", color: "blue.500" },
    { icon: FaShieldAlt, title: "Apprentissage Sécurisé", color: "green.500" },
    { icon: FaTrophy, title: "Système de Récompenses", color: "yellow.500" },
    { icon: FaChartLine, title: "Suivi Détaillé", color: "purple.500" },
  ];

  return (
    <Box minH="100vh" bg={gradient} position="relative" overflow="hidden">
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
        <Flex
          minH="100vh"
          alignItems="center"
          justifyContent={{ base: "center", lg: "space-between" }}
          gap={8}
          py={8}
        >
          {/* Section gauche - Présentation */}
          <MotionBox
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            flex="1"
            display={{ base: "none", lg: "block" }}
            color="white"
            pr={12}
          >
            <VStack align="start" spacing={8}>
              {/* Logo et titre */}
              <VStack align="start" spacing={4}>
                <HStack spacing={4}>
                  <Box p={3} bg="whiteAlpha.200" borderRadius="xl">
                    <Icon as={GiSteeringWheel} boxSize={10} />
                  </Box>
                  <Heading size="2xl" fontWeight="bold">
                    Highway Quiz Academy
                  </Heading>
                </HStack>
                <Text fontSize="xl" opacity="0.9">
                  Maîtrisez le code de la route avec notre plateforme interactive
                </Text>
              </VStack>

              {/* Features */}
              <VStack align="start" spacing={6}>
                <Heading size="md">🎯 Pourquoi nous choisir ?</Heading>
                <SimpleGrid columns={2} spacing={4}>
                  {features.map((feature, index) => (
                    <HStack key={index} spacing={3}>
                      <Box p={2} bg="whiteAlpha.200" borderRadius="lg">
                        <Icon as={feature.icon} color={feature.color} boxSize={5} />
                      </Box>
                      <Text>{feature.title}</Text>
                    </HStack>
                  ))}
                </SimpleGrid>
              </VStack>

              {/* Statistiques */}
              <Card bg="whiteAlpha.200" backdropFilter="blur(10px)" borderRadius="xl">
                <CardBody>
                  <SimpleGrid columns={3} spacing={4}>
                    <Box textAlign="center">
                      <Text fontSize="2xl" fontWeight="bold">10K+</Text>
                      <Text fontSize="sm" opacity="0.8">Utilisateurs</Text>
                    </Box>
                    <Box textAlign="center">
                      <Text fontSize="2xl" fontWeight="bold">95%</Text>
                      <Text fontSize="sm" opacity="0.8">Réussite</Text>
                    </Box>
                    <Box textAlign="center">
                      <Text fontSize="2xl" fontWeight="bold">500+</Text>
                      <Text fontSize="sm" opacity="0.8">Questions</Text>
                    </Box>
                  </SimpleGrid>
                </CardBody>
              </Card>

              {/* Témoignage */}
              <Box
                bg="whiteAlpha.200"
                p={6}
                borderRadius="xl"
                backdropFilter="blur(10px)"
              >
                <Text fontStyle="italic" mb={4}>
                  "Grâce à Highway Quiz, j'ai réussi mon permis du premier coup !"
                </Text>
                <HStack>
                  <Avatar size="sm" name="wiem H." />
                  <Box>
                    <Text fontWeight="bold">wiem H.</Text>
                    <Text fontSize="sm" opacity="0.8">DS & AI Engineering Student</Text>
                  </Box>
                </HStack>
              </Box>
            </VStack>
          </MotionBox>

          {/* Section droite - Formulaire */}
          <MotionBox
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            flex="1"
            maxW={{ base: "100%", lg: "450px" }}
          >
            <Card
              bg={cardBg}
              borderRadius="2xl"
              boxShadow="2xl"
              borderWidth="1px"
              borderColor={borderColor}
              overflow="hidden"
            >
              {/* Header de la carte */}
              <Box
                bgGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                color="white"
                py={8}
                textAlign="center"
              >
                <VStack spacing={4}>
                  <Box p={4} bg="whiteAlpha.200" borderRadius="xl" display="inline-block">
                    <Icon as={GiLaurelsTrophy} boxSize={10} />
                  </Box>
                  <Heading size="xl">Bienvenue !</Heading>
                  <Text opacity="0.9">
                    Rejoignez notre communauté d'apprenants
                  </Text>
                </VStack>
              </Box>

              <CardBody p={8}>
                <Tabs variant="soft-rounded" colorScheme="purple">
                  <TabList mb={8}>
                    <Tab flex="1" py={3} fontSize="md" fontWeight="medium">
                      <HStack spacing={2}>
                        <Icon as={FaLock} />
                        <Text>Connexion</Text>
                      </HStack>
                    </Tab>
                    <Tab flex="1" py={3} fontSize="md" fontWeight="medium">
                      <HStack spacing={2}>
                        <Icon as={FaUserPlus} />
                        <Text>Inscription</Text>
                      </HStack>
                    </Tab>
                  </TabList>

                  <TabPanels>
                    <TabPanel p={0}>
                      <ScaleFade in={true}>
                        <Login />
                      </ScaleFade>
                    </TabPanel>
                    <TabPanel p={0}>
                      <ScaleFade in={true}>
                        <Signup />
                      </ScaleFade>
                    </TabPanel>
                  </TabPanels>
                </Tabs>

                <Divider my={6} />

                {/* Avantages */}
                <VStack spacing={3} align="start">
                  <Text fontWeight="semibold" color={textColor}>
                    🚀 Ce que vous obtenez :
                  </Text>
                  {[
                    "Assistant IA 24/7",
                    "Suivi de progression",
                    "Badges et récompenses",
                    "Classement communautaire"
                  ].map((item, index) => (
                    <HStack key={index} spacing={2}>
                      <Icon as={FaCheckCircle} color="green.500" boxSize={4} />
                      <Text fontSize="sm" color="gray.600">{item}</Text>
                    </HStack>
                  ))}
                </VStack>

                
              </CardBody>
            </Card>

            {/* Info copyright */}
            <Text
              mt={4}
              textAlign="center"
              fontSize="sm"
              color={useColorModeValue("whiteAlpha.800", "gray.300")}
            >
              © 2026 Highway Quiz Academy. Tous droits réservés.
            </Text>
          </MotionBox>
        </Flex>
      </Container>

      {/* Version mobile - Présentation simplifiée */}
      <Box display={{ base: "block", lg: "none" }} color="white" textAlign="center" py={8} px={4}>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <VStack spacing={6}>
            <Icon as={GiSteeringWheel} boxSize={16} />
            <Heading size="xl">Highway Quiz Academy</Heading>
            <Text fontSize="lg" opacity="0.9">
              Maîtrisez le code de la route avec notre plateforme interactive
            </Text>
          </VStack>
        </MotionBox>
      </Box>
    </Box>
  );
};

export default Homepage;