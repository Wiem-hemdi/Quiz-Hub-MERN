import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Container,
  Heading,
  Card,
  CardBody,
  Badge,
  Avatar,
  Flex,
  HStack,
  VStack,
  Center,
  Progress,
  Icon,
  useColorModeValue,
  SimpleGrid,
  Stat,
  StatNumber,
  StatHelpText,
  Grid,
  GridItem,
  Button,
  Tooltip,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from "@chakra-ui/react";
import axios from "axios";
import Navbar from "./navbar";
import { 
  FaTrophy, 
  FaCrown, 
  FaMedal, 
  FaChartLine, 
  FaGlobe, 
  FaFilter,
  FaUserFriends,
  FaArrowUp,
  FaFire,
  FaStar,
  FaCaretDown,
  FaCaretUp,
  FaUser,
  FaAward
} from "react-icons/fa";
import { GiLaurelsTrophy, GiRank3, GiRank2, GiRank1 } from "react-icons/gi";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const LeaderboardPage = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [lang_id, setLangId] = useState("");
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const [languages, setLanguages] = useState([]);
  const [shouldShow, setShouldShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("all");
  const [userPosition, setUserPosition] = useState(null);

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

  const fetchLanguages = async () => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const response = await axios.get(
        `http://localhost:5000/quiz/languages`,
        config
      );
      setLanguages(response.data);
    } catch (error) {
      console.error("Error fetching language data:", error);
    }
  };

  const getUniqueUsers = (data) => {
    const map = new Map();

    data.forEach((item) => {
      const userId = item.uid._id;

      if (!map.has(userId)) {
        map.set(userId, item);
      } else {
        // garder le meilleur score
        if (item.score_percent > map.get(userId).score_percent) {
          map.set(userId, item);
        }
      }
    });

    return Array.from(map.values());
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  useEffect(() => {
  const getLeaderboard = async (selectedLangId) => {
    setLoading(true);
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    try {
      // Cet appel correspond à getLeaderboard dans le Performance Controller
      const response = await axios.get(
  `http://localhost:5000/performance/leaderboard?lang_id=${selectedLangId}`,
  config
);

// DEBUG: Voir la structure complète
console.log("📊 Données brutes API:", response.data);
console.log("📊 Premier élément:", response.data[0]);

// Si c'est un tableau, vérifier la structure
if (response.data && response.data.length > 0) {
  const firstItem = response.data[0];
  console.log("🔍 Clés du premier élément:", Object.keys(firstItem));
  console.log("👤 Contenu du premier élément:", firstItem);
}
      // La réponse devrait être directement le tableau du classement
      const leaderboardData = response.data; // Pas besoin de getUniqueUsers
      
      // Trier par score décroissant (sécurité si non déjà trié)
      leaderboardData.sort((a, b) => b.score_percent - a.score_percent);
      
      setLeaderboardData(leaderboardData);
      
      // Trouver votre position
      const userIndex = leaderboardData.findIndex(
        entry => entry.uid === userInfo._id // Note: entry.uid et non entry.uid._id
      );
      setUserPosition(userIndex !== -1 ? userIndex + 1 : null);
      
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger le classement",
        status: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };
  if (lang_id) {
    getLeaderboard(lang_id);
    setShouldShow(true);
  } else {
    setShouldShow(false);
  }
}, [lang_id, userInfo.token, userInfo._id]); // Ajoutez les dépendances

  const getRankIcon = (rank) => {
    if (rank === 1) return <Icon as={GiRank1} color="yellow.500" boxSize={6} />;
    if (rank === 2) return <Icon as={GiRank2} color="gray.500" boxSize={6} />;
    if (rank === 3) return <Icon as={GiRank3} color="orange.500" boxSize={6} />;
    return <Text fontWeight="bold" color="gray.500">{rank}</Text>;
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "green.500";
    if (score >= 75) return "blue.500";
    if (score >= 60) return "yellow.500";
    return "red.500";
  };

  const getScoreBadge = (score) => {
    if (score >= 90) return "Excellent";
    if (score >= 75) return "Très bien";
    if (score >= 60) return "Bon";
    return "À améliorer";
  };

  const getUsernameDisplay = (entry, rank) => {
    const name = entry.uid?.name || "Utilisateur";
    
    // Pour les 3 premiers, ajouter des médailles dans le nom
    if (rank === 1) {
      return (
        <Flex alignItems="center" gap={2}>
          <Text fontWeight="bold">{name}</Text>
          <Tooltip label="🥇 Champion">
            <Icon as={FaCrown} color="yellow.500" boxSize={4} />
          </Tooltip>
        </Flex>
      );
    }
    
    if (rank === 2) {
      return (
        <Flex alignItems="center" gap={2}>
          <Text fontWeight="bold">{name}</Text>
          <Tooltip label="🥈 Vice-champion">
            <Icon as={FaMedal} color="gray.500" boxSize={4} />
          </Tooltip>
        </Flex>
      );
    }
    
    if (rank === 3) {
      return (
        <Flex alignItems="center" gap={2}>
          <Text fontWeight="bold">{name}</Text>
          <Tooltip label="🥉 Troisième place">
            <Icon as={FaAward} color="orange.500" boxSize={4} />
          </Tooltip>
        </Flex>
      );
    }
    
    // Pour les autres, afficher le nom avec un indicateur si c'est l'utilisateur actuel
    return (
      <Flex alignItems="center" gap={2}>
        <Text fontWeight="medium">{name}</Text>
        {entry.uid._id === userInfo._id && (
          <Badge colorScheme="purple" size="sm">
            Vous
          </Badge>
        )}
      </Flex>
    );
  };

  const renderTopThree = () => {
    if (leaderboardData.length < 3) return null;
    
    return (
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        {/* 2ème place */}
        <MotionBox
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card
            bg={cardBg}
            borderRadius="2xl"
            boxShadow="lg"
            border="2px solid"
            borderColor="gray.300"
            position="relative"
            pt={10}
          >
            <Center position="absolute" top={-6} left="50%" transform="translateX(-50%)">
              <Center
                w={12}
                h={12}
                borderRadius="full"
                bg="gray.100"
                border="3px solid"
                borderColor="gray.300"
              >
                <Icon as={GiRank2} color="gray.500" boxSize={6} />
              </Center>
            </Center>
            <CardBody textAlign="center">
              <VStack spacing={3}>
                <Avatar
                  size="lg"
                  name={leaderboardData[1]?.uid?.name}
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${leaderboardData[1]?.uid?.email}`}
                />
                <Heading size="md">{leaderboardData[1]?.uid?.name}</Heading>
                <Text fontSize="sm" color="gray.500">🥈 Vice-champion</Text>
                <Badge colorScheme="gray" fontSize="sm">
                  #{2}
                </Badge>
                <Progress
                  value={leaderboardData[1]?.score_percent}
                  colorScheme="blue"
                  size="lg"
                  borderRadius="full"
                  w="100%"
                />
                <Text fontSize="xl" fontWeight="bold" color="blue.500">
                  {leaderboardData[1]?.score_percent}%
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </MotionBox>

        {/* 1ère place */}
        <MotionBox
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <Card
            bg={cardBg}
            borderRadius="2xl"
            boxShadow="2xl"
            border="2px solid"
            borderColor="yellow.400"
            position="relative"
            pt={12}
            transform={{ md: "scale(1.05)" }}
          >
            <Center position="absolute" top={-8} left="50%" transform="translateX(-50%)">
              <Center
                w={16}
                h={16}
                borderRadius="full"
                bg="yellow.100"
                border="4px solid"
                borderColor="yellow.400"
              >
                <Icon as={GiRank1} color="yellow.500" boxSize={8} />
              </Center>
            </Center>
            <CardBody textAlign="center">
              <VStack spacing={4}>
                <Avatar
                  size="xl"
                  name={leaderboardData[0]?.uid?.name}
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${leaderboardData[0]?.uid?.email}`}
                  border="4px solid"
                  borderColor="yellow.300"
                />
                <Heading size="lg">{leaderboardData[0]?.uid?.name}</Heading>
                <Text fontSize="sm" color="yellow.600" fontWeight="bold">🥇 Champion</Text>
                <Badge colorScheme="yellow" fontSize="md">
                  #1
                </Badge>
                <Progress
                  value={leaderboardData[0]?.score_percent}
                  colorScheme="yellow"
                  size="lg"
                  borderRadius="full"
                  w="100%"
                />
                <Text fontSize="2xl" fontWeight="bold" color="yellow.600">
                  {leaderboardData[0]?.score_percent}%
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </MotionBox>

        {/* 3ème place */}
        <MotionBox
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card
            bg={cardBg}
            borderRadius="2xl"
            boxShadow="lg"
            border="2px solid"
            borderColor="orange.300"
            position="relative"
            pt={10}
          >
            <Center position="absolute" top={-6} left="50%" transform="translateX(-50%)">
              <Center
                w={12}
                h={12}
                borderRadius="full"
                bg="orange.100"
                border="3px solid"
                borderColor="orange.300"
              >
                <Icon as={GiRank3} color="orange.500" boxSize={6} />
              </Center>
            </Center>
            <CardBody textAlign="center">
              <VStack spacing={3}>
                <Avatar
                  size="lg"
                  name={leaderboardData[2]?.uid?.name}
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${leaderboardData[2]?.uid?.email}`}
                />
                <Heading size="md">{leaderboardData[2]?.uid?.name}</Heading>
                <Text fontSize="sm" color="orange.500">🥉 Troisième</Text>
                <Badge colorScheme="orange" fontSize="sm">
                  #{3}
                </Badge>
                <Progress
                  value={leaderboardData[2]?.score_percent}
                  colorScheme="orange"
                  size="lg"
                  borderRadius="full"
                  w="100%"
                />
                <Text fontSize="xl" fontWeight="bold" color="orange.500">
                  {leaderboardData[2]?.score_percent}%
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </MotionBox>
      </SimpleGrid>
    );
  };

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
                <Icon as={GiLaurelsTrophy} boxSize={12} />
                <Heading size="2xl" fontWeight="bold">
                  Classement
                </Heading>
              </HStack>
              <Text fontSize="xl" opacity="0.9">
                Découvrez les meilleurs apprenants et mesurez-vous aux autres
              </Text>
            </VStack>
            
            {/* Stats utilisateur */}
            {userPosition && (
              <Card bg="whiteAlpha.200" backdropFilter="blur(10px)" borderRadius="xl">
                <CardBody>
                  <VStack spacing={2}>
                    <Text fontSize="sm" opacity="0.8">Votre position</Text>
                    <Heading size="2xl">#{userPosition}</Heading>
                    <Text fontSize="sm" opacity="0.8">
                      Sur {leaderboardData.length} participants
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            )}
          </Flex>
        </Container>
      </Box>

      <Container maxW="7xl" py={8} px={{ base: 4, lg: 8 }}>
        {/* Filtres */}
        <Card bg={cardBg} borderRadius="2xl" boxShadow="lg" mb={8}>
          <CardBody>
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
              <Box>
                <Text fontWeight="semibold" mb={2} color={textColor}>
                  <Icon as={FaGlobe} mr={2} />
                  Sélectionnez une langue
                </Text>
                <Select
                  placeholder="Choisir une langue"
                  value={lang_id}
                  onChange={(e) => setLangId(e.target.value)}
                  size="lg"
                  focusBorderColor={accentColor}
                  bg={useColorModeValue("white", "gray.700")}
                  borderColor={borderColor}
                >
                  {languages.map((language) => (
                    <option key={language} value={language}>
                      {language.toUpperCase()}
                    </option>
                  ))}
                </Select>
              </Box>
              
              <Box>
                <Text fontWeight="semibold" mb={2} color={textColor}>
                  <Icon as={FaFilter} mr={2} />
                  Période
                </Text>
                <Select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  size="lg"
                  focusBorderColor={accentColor}
                  bg={useColorModeValue("white", "gray.700")}
                  borderColor={borderColor}
                >
                  <option value="all">Tout le temps</option>
                  <option value="month">Ce mois</option>
                  <option value="week">Cette semaine</option>
                  <option value="today">Aujourd'hui</option>
                </Select>
              </Box>
            </Grid>
          </CardBody>
        </Card>

        {/* Top 3 */}
        {shouldShow && leaderboardData.length >= 3 && renderTopThree()}

        {/* Tableau principal */}
        {shouldShow ? (
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card bg={cardBg} borderRadius="2xl" boxShadow="lg">
              <CardBody>
                <Flex alignItems="center" justifyContent="space-between" mb={6}>
                  <Heading size="lg" color={textColor}>
                    <Icon as={FaChartLine} mr={3} />
                    Classement complet
                    {lang_id && (
                      <Badge ml={3} colorScheme="purple" fontSize="lg">
                        {lang_id.toUpperCase()}
                      </Badge>
                    )}
                  </Heading>
                  <Text color="gray.500">
                    {leaderboardData.length} participants
                  </Text>
                </Flex>

                {loading ? (
                  <Center py={20}>
                    <VStack spacing={4}>
                      <Progress size="lg" isIndeterminate colorScheme="purple" width="300px" />
                      <Text color="gray.500">Chargement du classement...</Text>
                    </VStack>
                  </Center>
                ) : leaderboardData.length > 0 ? (
                  <Box overflowX="auto">
<Table variant="simple">
  <Thead>
    <Tr bg={useColorModeValue("gray.50", "gray.700")}>
      <Th fontWeight="bold" color={textColor}>Rang</Th>
      <Th fontWeight="bold" color={textColor}>Utilisateur</Th>
      <Th fontWeight="bold" color={textColor}>Score</Th>
      <Th fontWeight="bold" color={textColor}>Niveau</Th>
    </Tr>
  </Thead>
  <Tbody>
    {leaderboardData.map((entry, index) => {
      const isCurrentUser = entry.uid === userInfo._id || 
                           (entry.user && entry.user._id === userInfo._id);
      const rank = index + 1;
      
      // Essayez plusieurs structures possibles
      const name = entry.name || 
                  (entry.user && entry.user.name) || 
                  entry.uid?.name || 
                  "Utilisateur";
      
      const email = entry.email || 
                   (entry.user && entry.user.email) || 
                   entry.uid?.email || 
                   "";
      
      const score = entry.score_percent || 
                   entry.bestScore || 
                   entry.score || 
                   0;
      
      return (
        <Tr
          key={entry._id || index}
          bg={isCurrentUser ? useColorModeValue("purple.50", "purple.900") : "transparent"}
          borderLeft={isCurrentUser ? "4px solid" : "none"}
          borderLeftColor="purple.500"
          _hover={{
            bg: useColorModeValue("gray.50", "gray.700"),
            transform: "translateX(4px)",
            transition: "all 0.2s"
          }}
        >
          <Td>
            <Flex alignItems="center" gap={3}>
              {rank <= 3 ? (
                getRankIcon(rank)
              ) : (
                <Center
                  w={8}
                  h={8}
                  borderRadius="full"
                  bg={useColorModeValue("gray.100", "gray.700")}
                >
                  <Text fontWeight="bold">{rank}</Text>
                </Center>
              )}
              {index < leaderboardData.length - 1 && 
               score > (leaderboardData[index + 1]?.score_percent || leaderboardData[index + 1]?.bestScore) && (
                <Icon as={FaCaretUp} color="green.500" />
              )}
            </Flex>
          </Td>
          <Td>
            <Flex alignItems="center" gap={3}>
              <Avatar
                size="sm"
                name={name}
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${email || name}`}
              />
              <Box>
                <Flex alignItems="center" gap={2} mb={1}>
                  <Text fontWeight={isCurrentUser ? "bold" : "medium"}>
                    {name}
                  </Text>
                  {rank === 1 && (
                    <Tooltip label="🥇 Champion">
                      <Icon as={FaCrown} color="yellow.500" boxSize={4} />
                    </Tooltip>
                  )}
                  {rank === 2 && (
                    <Tooltip label="🥈 Vice-champion">
                      <Icon as={FaMedal} color="gray.500" boxSize={4} />
                    </Tooltip>
                  )}
                  {rank === 3 && (
                    <Tooltip label="🥉 Troisième place">
                      <Icon as={FaAward} color="orange.500" boxSize={4} />
                    </Tooltip>
                  )}
                  {isCurrentUser && (
                    <Badge colorScheme="purple" size="sm">
                      Vous
                    </Badge>
                  )}
                </Flex>
                <Text fontSize="sm" color="gray.500">
                  {email}
                </Text>
              </Box>
            </Flex>
          </Td>
          <Td>
            <VStack align="start" spacing={1}>
              <Text fontSize="lg" fontWeight="bold" color={getScoreColor(score)}>
                {score}%
              </Text>
              <Progress
                value={score}
                colorScheme={
                  score >= 90 ? "green" :
                  score >= 75 ? "blue" :
                  score >= 60 ? "yellow" : "red"
                }
                size="sm"
                width="100px"
                borderRadius="full"
              />
            </VStack>
          </Td>
          <Td>
            <Badge
              colorScheme={
                score >= 90 ? "green" :
                score >= 75 ? "blue" :
                score >= 60 ? "yellow" : "red"
              }
              fontSize="sm"
              px={3}
              py={1}
              borderRadius="full"
            >
              {getScoreBadge(score)}
            </Badge>
          </Td>
        </Tr>
      );
    })}
  </Tbody>
</Table>
                  </Box>
                ) : (
                  <Center py={20}>
                    <VStack spacing={4}>
                      <Icon as={FaUserFriends} boxSize={16} color="gray.400" />
                      <Text fontSize="lg" color="gray.500">Aucun participant pour cette langue</Text>
                      <Text color="gray.400">Soyez le premier à participer !</Text>
                    </VStack>
                  </Center>
                )}
              </CardBody>
            </Card>
          </MotionBox>
        ) : (
          <Center py={20}>
            <VStack spacing={6} textAlign="center">
              <Icon as={GiLaurelsTrophy} boxSize={20} color="gray.400" />
              <Box>
                <Heading size="lg" mb={2} color={textColor}>
                  Bienvenue sur le Classement
                </Heading>
                <Text color="gray.500" maxW="md">
                  Sélectionnez une langue pour découvrir le classement des meilleurs apprenants.
                  Comparez vos scores et progressez avec les autres !
                </Text>
              </Box>
              <Select
                placeholder="👆 Commencez par choisir une langue"
                value={lang_id}
                onChange={(e) => setLangId(e.target.value)}
                size="lg"
                width="300px"
                focusBorderColor={accentColor}
              >
                {languages.map((language) => (
                  <option key={language} value={language}>
                    {language.toUpperCase()}
                  </option>
                ))}
              </Select>
            </VStack>
          </Center>
        )}

        {/* Section Conseils */}
        {shouldShow && leaderboardData.length > 0 && (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mt={8}>
            <Card bg={cardBg} borderRadius="xl" boxShadow="sm">
              <CardBody>
                <VStack spacing={3} align="start">
                  <HStack>
                    <Center w={10} h={10} borderRadius="lg" bg="blue.100">
                      <Icon as={FaArrowUp} color="blue.500" />
                    </Center>
                    <Text fontWeight="bold">Progressez</Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    Améliorez votre score de 10% chaque semaine pour monter dans le classement
                  </Text>
                </VStack>
              </CardBody>
            </Card>

            <Card bg={cardBg} borderRadius="xl" boxShadow="sm">
              <CardBody>
                <VStack spacing={3} align="start">
                  <HStack>
                    <Center w={10} h={10} borderRadius="lg" bg="green.100">
                      <Icon as={FaFire} color="green.500" />
                    </Center>
                    <Text fontWeight="bold">Maintenez votre série</Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    Les utilisateurs actifs quotidiennement progressent 3x plus vite
                  </Text>
                </VStack>
              </CardBody>
            </Card>

            <Card bg={cardBg} borderRadius="xl" boxShadow="sm">
              <CardBody>
                <VStack spacing={3} align="start">
                  <HStack>
                    <Center w={10} h={10} borderRadius="lg" bg="purple.100">
                      <Icon as={FaTrophy} color="purple.500" />
                    </Center>
                    <Text fontWeight="bold">Objectif Top 10</Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    Les 10 premiers reçoivent des badges spéciaux chaque mois
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        )}
      </Container>
    </Box>
  );
};

export default LeaderboardPage;
