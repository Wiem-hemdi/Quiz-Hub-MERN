import React, { useEffect, useState } from "react";
import {
  Box, Text, VStack, HStack, Badge, Progress,
  Container, Heading, SimpleGrid, Card, CardBody,
  Stat, StatLabel, StatNumber, StatHelpText,
  Table, Thead, Tbody, Tr, Th, Td, Center,
  Button, Alert, AlertIcon, useToast,
  Flex, Grid, GridItem, Avatar, Icon,
  Divider, Tag, TagLabel, TagLeftIcon,
  useColorModeValue, IconButton, Tooltip,
  Image, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalBody, ModalFooter, useDisclosure,
  Tabs, TabList, TabPanels, Tab, TabPanel,
  CircularProgress, CircularProgressLabel,
  Drawer, DrawerBody, DrawerHeader,
  DrawerOverlay, DrawerContent, DrawerCloseButton
} from "@chakra-ui/react";
import Navbar from "./navbar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaTrophy, FaFire, FaChartLine, FaAward,
  FaHome, FaSync, FaCrown, FaUser,
  FaMedal, FaLanguage, FaStar, FaSignOutAlt,
  FaTrash, FaGraduationCap, FaEye, FaEdit,
  FaLightbulb, FaShieldAlt, FaCalendarAlt,
  FaBook, FaGlobe, FaCogs, FaBell,
  FaRocket, FaGem, FaUsers, FaBrain,
  FaChevronRight, FaArrowUp, FaCog,
  FaPalette, FaMoon, FaSun
} from "react-icons/fa";
import { GiLaurelsTrophy, GiRank3, GiRank2, GiRank1 } from "react-icons/gi";
import { MdDashboard, MdLeaderboard, MdLanguage } from "react-icons/md";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import withReactContent from 'sweetalert2-react-content';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const MySwal = withReactContent(Swal);

const ProfilePage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
  const [proficiencyArr, setProficiencyArr] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const { isOpen, onOpen, onClose } = useDisclosure();

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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        };

        const [profileRes, leaderboardRes, proficiencyRes] = await Promise.all([
          axios.get("http://localhost:5000/api/stats/profile", config),
          axios.get("http://localhost:5000/api/stats/leaderboard", config),
          axios.get(`http://localhost:5000/performance/proficiency?uid=${userInfo._id}`, config)
        ]);

        setUserStats(profileRes.data);
        setLeaderboard(leaderboardRes.data.leaderboard || []);
        setProficiencyArr(proficiencyRes.data);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les données. Affichage des données simulées.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userInfo.token, userInfo._id]);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/", { replace: true });
  };

  const handleReset = async () => {
    const result = await MySwal.fire({
      title: '🔁 Réinitialiser les statistiques',
      html: '<p>Êtes-vous sûr de vouloir réinitialiser toutes vos statistiques ?</p><p><strong>Cette action est irréversible</strong></p>',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, réinitialiser',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.post(
          "http://localhost:5000/api/stats/reset-stats",
          { userId: userInfo._id },
          config
        );
        
        toast({
          title: "✅ Statistiques réinitialisées",
          description: "Vos statistiques ont été réinitialisées avec succès.",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top-right"
        });
        
        setUserStats(null);
        setLeaderboard([]);
        setProficiencyArr([]);
      } catch (err) {
        console.error(err);
        toast({
          title: "❌ Erreur",
          description: "Impossible de réinitialiser les statistiques",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top-right"
        });
      }
    }
  };

  const userRank = leaderboard.findIndex(p => p.email === userInfo.email) + 1;

  // Données simulées pour le design
  const recentActivities = [
    { id: 1, action: "Quiz terminé", details: "Anglais - Niveau Avancé", score: "95%", time: "Il y a 2h" },
    { id: 2, action: "Badge obtenu", details: "🔥 Streak Master", score: "", time: "Il y a 1 jour" },
    { id: 3, action: "Niveau atteint", details: "Niveau 15", score: "", time: "Il y a 3 jours" },
    { id: 4, action: "Quiz terminé", details: "Français - Grammaire", score: "88%", time: "Il y a 5 jours" }
  ];

  const badges = [
    { id: 1, name: "Débutant", icon: "🎯", color: "blue.400" },
    { id: 2, name: "Streak Master", icon: "🔥", color: "orange.400" },
    { id: 3, name: "Perfectionniste", icon: "✨", color: "yellow.400" },
    { id: 4, name: "Polyglotte", icon: "🌍", color: "green.400" },
    { id: 5, name: "Rapide", icon: "⚡", color: "purple.400" }
  ];

  if (loading) {
    return (
      <Center minH="100vh" flexDirection="column" gap={6} bg={bgColor}>
        <MotionBox
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Icon as={FaBrain} boxSize={16} color={accentColor} />
        </MotionBox>
        <Box textAlign="center">
          <Heading size="lg" mb={2} color={textColor}>Chargement de votre profil...</Heading>
          <Text color="gray.600">Nous préparons votre expérience personnalisée</Text>
        </Box>
        <Progress size="lg" width="300px" isIndeterminate colorScheme="purple" borderRadius="full" />
      </Center>
    );
  }

  return (
    <Box minH="100vh" bg={bgColor}>
      <Navbar />
      
      {/* Header Hero */}
      <Box
        bg={gradient}
        color="white"
        pt={20}
        pb={8}
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
          <Flex direction={{ base: "column", md: "row" }} alignItems="center" justifyContent="space-between" gap={8}>
            <Flex alignItems="center" gap={6}>
              <Avatar
                size="2xl"
                name={userInfo.name}
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo.email}`}
                border="4px solid"
                borderColor="whiteAlpha.400"
                boxShadow="xl"
              />
              <VStack align="start" spacing={3}>
                <Heading size="2xl" fontWeight="bold">
                  {userInfo.name}
                  {userRank <= 3 && (
                    <Badge ml={3} colorScheme={userRank === 1 ? "yellow" : userRank === 2 ? "gray" : "orange"} fontSize="lg">
                      #{userRank} {userRank === 1 ? "🥇" : userRank === 2 ? "🥈" : "🥉"}
                    </Badge>
                  )}
                </Heading>
                <HStack spacing={4}>
                  <Badge 
                    colorScheme={userInfo.isTeacher ? "purple" : "blue"} 
                    fontSize="md" 
                    px={4} 
                    py={1} 
                    borderRadius="full"
                    bg="whiteAlpha.200"
                  >
                    {userInfo.isTeacher ? "👨‍🏫 Enseignant" : "👨‍🎓 Étudiant"}
                  </Badge>
                  <Text fontSize="lg" opacity="0.9">
                    <Icon as={FaGem} mr={2} />
                    {userStats?.level || "Débutant"}
                  </Text>
                </HStack>
                <Text fontSize="md" opacity="0.8">
                  <Icon as={FaBook} mr={2} />
                  {proficiencyArr.length} langues maîtrisées
                </Text>
              </VStack>
            </Flex>
            
            <HStack spacing={3}>
              <Tooltip label="Paramètres">
                <IconButton
                  aria-label="Settings"
                  icon={<FaCog />}
                  colorScheme="whiteAlpha"
                  variant="outline"
                  size="lg"
                  onClick={onOpen}
                  _hover={{ bg: "whiteAlpha.200" }}
                />
              </Tooltip>
              <Button
                leftIcon={<FaSignOutAlt />}
                colorScheme="whiteAlpha"
                variant="outline"
                size="lg"
                onClick={handleLogout}
                _hover={{ bg: "whiteAlpha.200" }}
              >
                Déconnexion
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="7xl" py={8} px={{ base: 4, lg: 8 }}>
        {error && (
          <Alert status="warning" mb={6} borderRadius="lg" variant="left-accent">
            <AlertIcon />
            <Box flex="1">
              <Text fontWeight="bold">Mode démo activé</Text>
              <Text fontSize="sm">{error}</Text>
            </Box>
          </Alert>
        )}

        {/* Navigation Tabs */}
        <Tabs variant="soft-rounded" colorScheme="purple" mb={8}>
          <TabList mb={6} bg={cardBg} p={2} borderRadius="xl">
            <Tab onClick={() => setActiveTab("overview")}>
              <Icon as={MdDashboard} mr={2} />
              Vue d'ensemble
            </Tab>
            <Tab onClick={() => setActiveTab("stats")}>
              <Icon as={FaChartLine} mr={2} />
              Statistiques
            </Tab>
            <Tab onClick={() => setActiveTab("languages")}>
              <Icon as={MdLanguage} mr={2} />
              Langues
            </Tab>
            
          </TabList>

          <TabPanels>
            {/* Panel 1: Vue d'ensemble */}
            <TabPanel p={0}>
              <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
                {/* Statistiques principales */}
                <GridItem>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    {/* Carte XP */}
                    <MotionCard
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      bg={cardBg}
                      borderRadius="2xl"
                      boxShadow="lg"
                      overflow="hidden"
                      borderLeft="4px solid"
                      borderLeftColor="purple.500"
                      _hover={{ transform: "translateY(-4px)", boxShadow: "xl" }}
                      transition="all 0.3s"
                    >
                      <CardBody>
                        <Flex alignItems="center" justifyContent="space-between" mb={4}>
                          <VStack align="start" spacing={1}>
                            <Text color="gray.500" fontSize="sm" fontWeight="semibold">
                              TOTAL XP
                            </Text>
                            <Heading size="2xl" color={textColor}>
                              {userStats?.xp || "0"}
                            </Heading>
                          </VStack>
                          <CircularProgress
                            value={userStats?.xp % 100 || 0}
                            color="purple.500"
                            size="80px"
                            thickness="8px"
                          >
                            <CircularProgressLabel fontSize="lg" fontWeight="bold">
                              {userStats?.level || "1"}
                            </CircularProgressLabel>
                          </CircularProgress>
                        </Flex>
                        <Text color="gray.500" fontSize="sm">
                          Niveau suivant dans {100 - (userStats?.xp % 100 || 0)} XP
                        </Text>
                      </CardBody>
                    </MotionCard>

                    {/* Carte Streak */}
                    <MotionCard
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      bg={cardBg}
                      borderRadius="2xl"
                      boxShadow="lg"
                      borderLeft="4px solid"
                      borderLeftColor="orange.500"
                    >
                      <CardBody>
                        <VStack align="start" spacing={4}>
                          <HStack spacing={3}>
                            <Box p={3} bg="orange.100" borderRadius="xl">
                              <Icon as={FaFire} color="orange.500" boxSize={6} />
                            </Box>
                            <VStack align="start" spacing={0}>
                              <Text color="gray.500" fontSize="sm">SÉQUENCE</Text>
                              <Heading size="2xl">{userStats?.streak || "0"}</Heading>
                            </VStack>
                          </HStack>
                          <Progress
                            value={Math.min((userStats?.streak || 0) * 10, 100)}
                            colorScheme="orange"
                            size="lg"
                            borderRadius="full"
                          />
                        </VStack>
                      </CardBody>
                    </MotionCard>

                    {/* Carte Précision */}
                    <MotionCard
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      bg={cardBg}
                      borderRadius="2xl"
                      boxShadow="lg"
                      borderLeft="4px solid"
                      borderLeftColor="green.500"
                    >
                      <CardBody>
                        <VStack align="start" spacing={4}>
                          <HStack spacing={3}>
                            <Box p={3} bg="green.100" borderRadius="xl">
                              <Icon as={FaChartLine} color="green.500" boxSize={6} />
                            </Box>
                            <VStack align="start" spacing={0}>
                              <Text color="gray.500" fontSize="sm">PRÉCISION</Text>
                              <Heading size="2xl">{userStats?.accuracy || "0"}%</Heading>
                            </VStack>
                          </HStack>
                          <Text fontSize="sm" color="gray.500">
                            Sur {userStats?.totalQuizzes || "0"} quiz
                          </Text>
                        </VStack>
                      </CardBody>
                    </MotionCard>

                    {/* Carte Classement */}
                    <MotionCard
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      bg={cardBg}
                      borderRadius="2xl"
                      boxShadow="lg"
                      borderLeft="4px solid"
                      borderLeftColor="yellow.500"
                    >
                      <CardBody>
                        <VStack align="start" spacing={4}>
                          <HStack spacing={3}>
                            <Box p={3} bg="yellow.100" borderRadius="xl">
                              <Icon as={FaTrophy} color="yellow.500" boxSize={6} />
                            </Box>
                            <VStack align="start" spacing={0}>
                              <Text color="gray.500" fontSize="sm">CLASSEMENT</Text>
                              <Heading size="2xl">#{userRank || "-"}</Heading>
                            </VStack>
                          </HStack>
                          <Text fontSize="sm" color="gray.500">
                            Sur {leaderboard.length} joueurs
                          </Text>
                        </VStack>
                      </CardBody>
                    </MotionCard>
                  </SimpleGrid>

                  {/* Activités récentes */}
                  <MotionCard
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    bg={cardBg}
                    borderRadius="2xl"
                    boxShadow="lg"
                    mt={6}
                  >
                    <CardBody>
                      <Heading size="md" mb={6} display="flex" alignItems="center" gap={2}>
                        <Icon as={FaCalendarAlt} />
                        Activités récentes
                      </Heading>
                      <VStack align="stretch" spacing={3}>
                        {recentActivities.map(activity => (
                          <HStack
                            key={activity.id}
                            p={3}
                            borderRadius="lg"
                            bg="gray.50"
                            _dark={{ bg: "gray.700" }}
                            justify="space-between"
                          >
                            <HStack>
                              <Box w={2} h={2} bg="green.500" borderRadius="full" />
                              <Text fontWeight="medium">{activity.action}</Text>
                              <Text color="gray.500" fontSize="sm">{activity.details}</Text>
                            </HStack>
                            <HStack spacing={4}>
                              {activity.score && (
                                <Badge colorScheme="green">{activity.score}</Badge>
                              )}
                              <Text fontSize="sm" color="gray.500">{activity.time}</Text>
                            </HStack>
                          </HStack>
                        ))}
                      </VStack>
                    </CardBody>
                  </MotionCard>
                </GridItem>

                {/* Classement & Badges */}
                <GridItem>
                  {/* Classement */}
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
                        <Icon as={MdLeaderboard} />
                        Top 5
                      </Heading>
                      <VStack spacing={4}>
                        {leaderboard.slice(0, 5).map((player, index) => (
                          <HStack
                                key={index}
                                w="100%"
                                p={3}
                                borderRadius="lg"
                                bg={player.email === userInfo.email ? "purple.50" : "transparent"}
                                border="1px solid"
                                borderColor={player.email === userInfo.email ? "purple.200" : "gray.100"}
                                _dark={{
                                  bg: player.email === userInfo.email ? "purple.900" : "transparent",
                                  borderColor: player.email === userInfo.email ? "purple.600" : "gray.700"
                                }}
                              >
                                                           <Flex alignItems="center" gap={3} flex={1}>
                              <Center
                                w={8}
                                h={8}
                                borderRadius="full"
                                bg={
                                  index === 0 ? "yellow.100" :
                                  index === 1 ? "gray.100" :
                                  index === 2 ? "orange.100" : "gray.100"
                                }
                                _dark={{
                                  bg: index === 0 ? "yellow.900" :
                                  index === 1 ? "gray.700" :
                                  index === 2 ? "orange.900" : "gray.700"
                                }}
                              >
                                <Text
                                  fontWeight="bold"
                                  color={
                                    index === 0 ? "yellow.600" :
                                    index === 1 ? "gray.600" :
                                    index === 2 ? "orange.600" : "gray.600"
                                  }
                                >
                                  {index + 1}
                                </Text>
                              </Center>
                              <Avatar size="sm" name={player.name} />
                              <Box>
                                <Text fontWeight={player.email === userInfo.email ? "bold" : "medium"}>
                                  {player.name}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  Lvl {player.level}
                                </Text>
                              </Box>
                            </Flex>
                            <Badge colorScheme="purple">{player.xp} XP</Badge>
                          </HStack>
                        ))}
                      </VStack>
                    </CardBody>
                  </MotionCard>

                  {/* Badges */}
                  <MotionCard
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    bg={cardBg}
                    borderRadius="2xl"
                    boxShadow="lg"
                  >
                    <CardBody>
                      <Heading size="md" mb={6} display="flex" alignItems="center" gap={2}>
                        <Icon as={FaAward} />
                        Badges
                      </Heading>
                      <SimpleGrid columns={3} spacing={3}>
                        {badges.map(badge => (
                          <VStack key={badge.id} spacing={2}>
                            <Center
                              w={16}
                              h={16}
                              borderRadius="xl"
                              bg={`${badge.color}20`}
                              fontSize="2xl"
                            >
                              {badge.icon}
                            </Center>
                            <Text fontSize="xs" textAlign="center" fontWeight="medium">
                              {badge.name}
                            </Text>
                          </VStack>
                        ))}
                      </SimpleGrid>
                    </CardBody>
                  </MotionCard>
                </GridItem>
              </Grid>
            </TabPanel>

            {/* Panel 2: Statistiques détaillées */}
            <TabPanel p={0}>
              <Card bg={cardBg} borderRadius="2xl" boxShadow="lg">
                <CardBody>
                  <Heading size="lg" mb={6}>📈 Statistiques détaillées</Heading>
                  {/* Ajouter plus de statistiques ici */}
                </CardBody>
              </Card>
            </TabPanel>

            {/* Panel 3: Langues */}
            <TabPanel p={0}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {proficiencyArr.map(prof => (
                  <MotionCard
                    key={prof._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    bg={cardBg}
                    borderRadius="2xl"
                    boxShadow="lg"
                    _hover={{ transform: "translateY(-4px)", boxShadow: "xl" }}
                    transition="all 0.3s"
                  >
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <Flex alignItems="center" justifyContent="space-between">
                          <HStack>
                            <Icon as={FaGlobe} color="blue.500" />
                            <Text fontWeight="bold" fontSize="xl">{prof.language_id}</Text>
                          </HStack>
                          <Badge 
                            colorScheme={
                              prof.proficiencyLevel >= 80 ? "green" :
                              prof.proficiencyLevel >= 60 ? "blue" :
                              prof.proficiencyLevel >= 40 ? "yellow" : "red"
                            }
                            fontSize="md"
                            px={3}
                            py={1}
                            borderRadius="full"
                          >
                            {prof.proficiencyLevel}%
                          </Badge>
                        </Flex>
                        
                        <Box>
                          <Text fontSize="sm" color="gray.500" mb={2}>Progression</Text>
                          <Progress 
                            value={Math.min(prof.proficiencyLevel, 100)}
                            colorScheme={
                              prof.proficiencyLevel >= 80 ? "green" :
                              prof.proficiencyLevel >= 60 ? "blue" :
                              prof.proficiencyLevel >= 40 ? "yellow" : "red"
                            }
                            size="lg"
                            borderRadius="full"
                          />
                          <Flex justifyContent="space-between" mt={2} fontSize="xs" color="gray.500">
                            <Text>Débutant</Text>
                            <Text>Intermédiaire</Text>
                            <Text>Avancé</Text>
                            <Text>Expert</Text>
                          </Flex>
                        </Box>
                        
                        <Button
                          rightIcon={<FaChevronRight />}
                          colorScheme="purple"
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/quiz?lang=${prof.language_id}`)}
                        >
                          Continuer l'apprentissage
                        </Button>
                      </VStack>
                    </CardBody>
                  </MotionCard>
                ))}
              </SimpleGrid>
            </TabPanel>

          </TabPanels>
        </Tabs>

        {/* Boutons d'action */}
        <Flex justifyContent="center" gap={4} mt={8}>
          <Button
            leftIcon={<FaSync />}
            colorScheme="orange"
            variant="outline"
            size="lg"
            onClick={handleReset}
          >
            Réinitialiser les stats
          </Button>
          <Button
            leftIcon={<FaTrash />}
            colorScheme="red"
            variant="outline"
            size="lg"
            onClick={async () => {
              const result = await MySwal.fire({
                title: '⚠️ Supprimer le compte ?',
                html: '<p>Cette action est <strong>irréversible</strong> !</p>',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Supprimer définitivement',
                cancelButtonText: 'Annuler',
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                reverseButtons: true
              });

              if (result.isConfirmed) {
                try {
                  const config = {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                  };
                  await axios.delete(`http://localhost:5000/users/${userInfo._id}`, config);

                  MySwal.fire({
                    title: '💔 Compte supprimé',
                    text: 'Votre compte a été supprimé avec succès.',
                    icon: 'success',
                    timer: 3000
                  });

                  localStorage.removeItem("userInfo"); 
                  navigate("/", { replace: true });

                } catch (err) {
                  console.error("Erreur:", err);
                  MySwal.fire({
                    title: '❌ Erreur',
                    text: 'Impossible de supprimer votre compte.',
                    icon: 'error'
                  });
                }
              }
            }}
          >
            Supprimer mon compte
          </Button>
        </Flex>
      </Container>

      {/* Modal Paramètres */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>⚙️ Paramètres</ModalHeader>
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Text>Notifications</Text>
                <Icon as={FaBell} />
              </HStack>
              <HStack justify="space-between">
                <Text>Thème sombre</Text>
                <Icon as={FaMoon} />
              </HStack>
              <HStack justify="space-between">
                <Text>Langue de l'interface</Text>
                <Icon as={FaLanguage} />
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="purple" onClick={onClose}>
              Enregistrer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ProfilePage;