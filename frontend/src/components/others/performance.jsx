import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  Container,
  Heading,
  Card,
  CardBody,
  Flex,
  VStack,
  HStack,
  SimpleGrid,
  Badge,
  Progress,
  Icon,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  Center,
  Alert,
  AlertIcon,
  Tooltip
} from "@chakra-ui/react";
import axios from "axios";
import Chart from "react-apexcharts";
import Navbar from "./navbar";
import { 
  FaChartLine, 
  FaGlobe, 
  FaFilter,
  FaEye,
  FaDownload,
  FaCalendarAlt,
  FaTrophy,
  FaArrowUp,
  FaArrowDown,
  FaFire,
  FaBrain,
  FaCog,
  FaSync,
  FaInfoCircle
} from "react-icons/fa";
import { GiLaurelsTrophy } from "react-icons/gi";
import { motion } from "framer-motion";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const PerformanceGraph = () => {
  const [lang_id, setLangId] = useState("");
  const [performanceData, setPerformanceData] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("all");
  const [stats, setStats] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

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

  // Configuration des graphiques
  const [chartScoreData, setChartScoreData] = useState({
    options: {
      chart: {
        id: "performance-score",
        type: 'line',
        height: 350,
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true
          }
        },
        dropShadow: {
          enabled: true,
          color: '#000',
          top: 18,
          left: 7,
          blur: 10,
          opacity: 0.2
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350
          }
        }
      },
      colors: ["#667eea", "#764ba2"],
      stroke: {
        curve: 'smooth',
        width: 3
      },
      markers: {
        size: 5,
        colors: ['#667eea'],
        strokeColors: '#fff',
        strokeWidth: 2,
        hover: {
          size: 7
        }
      },
      title: {
        text: 'Progression du Score (%)',
        align: 'left',
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          color: textColor
        }
      },
      grid: {
        borderColor: borderColor,
        strokeDashArray: 5,
      },
      xaxis: {
        categories: [],
        title: {
          text: 'Tests',
          style: {
            color: textColor
          }
        },
        labels: {
          style: {
            colors: useColorModeValue('#666', '#aaa')
          }
        }
      },
      yaxis: {
        title: {
          text: 'Score (%)',
          style: {
            color: textColor
          }
        },
        min: 0,
        max: 100,
        labels: {
          style: {
            colors: useColorModeValue('#666', '#aaa')
          }
        }
      },
      tooltip: {
        theme: useColorModeValue('light', 'dark'),
        x: {
          show: true
        },
        y: {
          formatter: function (val) {
            return val + "%"
          }
        }
      }
    },
    series: [
      {
        name: "Score (%)",
        data: [],
      },
    ],
  });

  const [chartAccuracyData, setChartAccuracyData] = useState({
    options: {
      chart: {
        id: "performance-accuracy",
        type: 'line',
        height: 350,
        toolbar: {
          show: true
        }
      },
      colors: ["#46a832", "#36d399"],
      stroke: {
        curve: 'smooth',
        width: 3
      },
      markers: {
        size: 5,
        colors: ['#46a832'],
        strokeColors: '#fff',
        strokeWidth: 2
      },
      title: {
        text: 'Progression de la Précision',
        align: 'left',
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          color: textColor
        }
      },
      grid: {
        borderColor: borderColor,
        strokeDashArray: 5,
      },
      xaxis: {
        categories: [],
        title: {
          text: 'Tests',
          style: {
            color: textColor
          }
        },
        labels: {
          style: {
            colors: useColorModeValue('#666', '#aaa')
          }
        }
      },
      yaxis: {
        title: {
          text: 'Précision',
          style: {
            color: textColor
          }
        },
        min: 0,
        max: 100,
        labels: {
          style: {
            colors: useColorModeValue('#666', '#aaa')
          }
        }
      },
      tooltip: {
        theme: useColorModeValue('light', 'dark'),
        y: {
          formatter: function (val) {
            return val + "%"
          }
        }
      }
    },
    series: [
      {
        name: "Précision",
        data: [],
      },
    ],
  });

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

// Correction dans la fonction fetchData
const fetchData = async () => {
  if (!lang_id) return;
  
  setLoading(true);
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    const response = await axios.get(
      `http://localhost:5000/performance?uid=${userInfo._id}&lang_id=${lang_id}`,
      config
    );
    const data = response.data;
    setPerformanceData(data);
    
    // Calculer les statistiques AVEC CORRECTION
    if (data.length > 0) {
      const scores = data.map(item => item.score_percent || 0);
      const accuracies = data.map(item => item.accuracy || 0);
      
      // Fonction pour corriger les valeurs aberrantes
      const sanitizeValue = (value) => {
        const num = Number(value);
        if (isNaN(num) || !isFinite(num)) return 0;
        if (num > 1000000) return 0; // Valeur astronomique -> 0
        return Math.min(100, Math.max(0, num)); // Limiter entre 0 et 100
      };
      
      // Calculer les moyennes avec valeurs corrigées
      const sanitizedScores = scores.map(sanitizeValue);
      const sanitizedAccuracies = accuracies.map(sanitizeValue);
      
      const stats = {
        avgScore: (sanitizedScores.reduce((a, b) => a + b, 0) / sanitizedScores.length).toFixed(1),
        avgAccuracy: (sanitizedAccuracies.reduce((a, b) => a + b, 0) / sanitizedAccuracies.length).toFixed(1),
        bestScore: Math.max(...sanitizedScores),
        bestAccuracy: Math.max(...sanitizedAccuracies),
        totalTests: data.length,
        trend: sanitizedScores.length > 1 ? (sanitizedScores[sanitizedScores.length - 1] - sanitizedScores[0]) : 0,
        latestScore: sanitizedScores[sanitizedScores.length - 1],
        latestAccuracy: sanitizedAccuracies[sanitizedAccuracies.length - 1],
        // Garder les valeurs originales pour debug
        _original: {
          avgAccuracyRaw: (accuracies.reduce((a, b) => a + b, 0) / accuracies.length),
          maxAccuracy: Math.max(...accuracies)
        }
      };
      
      console.log("🔧 Stats corrigées:", stats);
      console.log("⚠️ Valeurs originales:", stats._original);
      
      setStats(stats);
      updateCharts(data.map((item, index) => ({
        ...item,
        score_percent: sanitizedScores[index],
        accuracy: sanitizedAccuracies[index]
      })));
    }
  } catch (error) {
    console.error("Error fetching performance data:", error);
  } finally {
    setLoading(false);
  }
};

  const updateCharts = (data) => {
    const categories = data.map((item, index) => `Test ${index + 1}`);
    const scorePercentData = data.map((item) => item.score_percent);
    const accuracyData = data.map((item) => item.accuracy);
    
    // Mise à jour du graphique Score
    setChartScoreData(prev => ({
      ...prev,
      options: {
        ...prev.options,
        xaxis: {
          ...prev.options.xaxis,
          categories: categories,
        },
        title: {
          ...prev.options.title,
          text: `Progression du Score - ${lang_id.toUpperCase()}`
        }
      },
      series: [
        {
          ...prev.series[0],
          data: scorePercentData,
        },
      ],
    }));
    
    // Mise à jour du graphique Accuracy
    setChartAccuracyData(prev => ({
      ...prev,
      options: {
        ...prev.options,
        xaxis: {
          ...prev.options.xaxis,
          categories: categories,
        },
        title: {
          ...prev.options.title,
          text: `Progression de la Précision - ${lang_id.toUpperCase()}`
        }
      },
      series: [
        {
          ...prev.series[0],
          data: accuracyData,
        },
      ],
    }));
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  useEffect(() => {
    if (lang_id) {
      fetchData();
    }
  }, [lang_id, timeRange]);

  const getTrendIcon = (trend) => {
    if (trend > 0) return <Icon as={FaArrowUp} color="green.500" />;
    if (trend < 0) return <Icon as={FaArrowDown} color="red.500" />;
    return <Icon as={FaChartLine} color="gray.500" />;
  };

  const getTrendText = (trend) => {
    if (trend > 0) return `+${trend.toFixed(1)}%`;
    if (trend < 0) return `${trend.toFixed(1)}%`;
    return "Stable";
  };

  const getTrendColor = (trend) => {
    if (trend > 0) return "green.500";
    if (trend < 0) return "red.500";
    return "gray.500";
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
                <Icon as={FaChartLine} boxSize={12} />
                <Heading size="2xl" fontWeight="bold">
                  Analyse de Performance
                </Heading>
              </HStack>
              <Text fontSize="xl" opacity="0.9">
                Suivez votre progression et analysez vos performances
              </Text>
            </VStack>
            
            {/* Boutons d'action */}
            <HStack spacing={4}>
              <Tooltip label="Exporter les données">
                <Button
                  leftIcon={<FaDownload />}
                  colorScheme="whiteAlpha"
                  variant="outline"
                  _hover={{ bg: "whiteAlpha.200" }}
                >
                  Exporter
                </Button>
              </Tooltip>
              <Button
                leftIcon={<FaCog />}
                colorScheme="whiteAlpha"
                variant="outline"
                onClick={onOpen}
                _hover={{ bg: "whiteAlpha.200" }}
              >
                Paramètres
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="7xl" py={8} px={{ base: 4, lg: 8 }}>
        {/* Filtres et sélection */}
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          bg={cardBg}
          borderRadius="2xl"
          boxShadow="lg"
          mb={8}
        >
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
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
                  isDisabled={loading}
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
                  <Icon as={FaCalendarAlt} mr={2} />
                  Période
                </Text>
                <Select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  size="lg"
                  focusBorderColor={accentColor}
                  bg={useColorModeValue("white", "gray.700")}
                  borderColor={borderColor}
                  isDisabled={loading}
                >
                  <option value="all">Tout le temps</option>
                  <option value="month">30 derniers jours</option>
                  <option value="week">7 derniers jours</option>
                  <option value="today">Aujourd'hui</option>
                </Select>
              </Box>
            </SimpleGrid>
          </CardBody>
        </MotionCard>

        {/* Statistiques principales */}
        {stats && (
  <MotionCard
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    bg={cardBg}
    borderRadius="2xl"
    boxShadow="lg"
    mb={8}
  >
    <CardBody>
      <Heading size="md" mb={6} display="flex" alignItems="center" gap={2}>
        <Icon as={FaTrophy} />
        Statistiques globales - {lang_id.toUpperCase()}
      </Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        {/* Score Moyen */}
        <Card bg={useColorModeValue("blue.50", "blue.900")} borderRadius="xl">
          <CardBody>
            <VStack spacing={3}>
              <HStack w="100%" justify="space-between">
                <Text fontSize="sm" color="blue.600" fontWeight="medium">
                  Score Moyen
                </Text>
                <Icon as={FaChartLine} color="blue.500" />
              </HStack>
              <Heading 
                size="2xl" 
                color="blue.700"
                fontSize={{ base: "xl", md: "2xl" }}
                overflow="hidden"
                textOverflow="ellipsis"
              >
                {stats.avgScore}%
              </Heading>
              <Progress 
                value={stats.avgScore} 
                colorScheme="blue" 
                size="sm" 
                w="100%" 
                borderRadius="full"
              />
            </VStack>
          </CardBody>
        </Card>

        {/* Précision Moyenne - CORRIGÉE */}
        {/* Précision Moyenne - VERSION SIMPLIFIÉE ET CORRECTE */}
<Card bg={useColorModeValue("green.50", "green.900")} borderRadius="xl">
  <CardBody>
    <VStack spacing={3}>
      <HStack w="100%" justify="space-between">
        <Text fontSize="sm" color="green.600" fontWeight="medium">
          Précision Moyenne
        </Text>
        <Icon as={FaBrain} color="green.500" />
      </HStack>
      <Heading 
        size="2xl" 
        color="green.700"
        fontSize={{ base: "xl", md: "2xl" }}
        overflow="hidden"
        textOverflow="ellipsis"
      >
        {(() => {
          const value = parseFloat(stats.avgAccuracy);
          // Si la valeur est invalide (NaN) ou n'est pas un nombre
          if (isNaN(value)) {
            return "0%";
          }
          // Formater simplement avec 1 décimale
          return `${value.toFixed(1)}%`;
        })()}
      </Heading>
      <Progress 
        value={parseFloat(stats.avgAccuracy) || 0} 
        colorScheme="green" 
        size="sm" 
        w="100%" 
        borderRadius="full"
      />
      {/* Indicateur de correction si nécessaire */}
      {stats?._original?.avgAccuracyRaw > 100 && (
        <Text fontSize="xs" color="gray.500" textAlign="center">
          Valeur corrigée depuis {stats._original.avgAccuracyRaw.toExponential(2)}
        </Text>
      )}
    </VStack>
  </CardBody>
</Card>

        {/* Meilleur Score */}
        <Card bg={useColorModeValue("purple.50", "purple.900")} borderRadius="xl">
          <CardBody>
            <VStack spacing={3}>
              <HStack w="100%" justify="space-between">
                <Text fontSize="sm" color="purple.600" fontWeight="medium">
                  Meilleur Score
                </Text>
                <Icon as={FaTrophy} color="purple.500" />
              </HStack>
              <Heading size="2xl" color="purple.700">
                {Math.min(100, stats.bestScore).toFixed(1)}%
              </Heading>
              <Badge colorScheme="purple" fontSize="sm">
                Record personnel
              </Badge>
            </VStack>
          </CardBody>
        </Card>

        {/* Tendance */}
        <Card bg={useColorModeValue("orange.50", "orange.900")} borderRadius="xl">
          <CardBody>
            <VStack spacing={3}>
              <HStack w="100%" justify="space-between">
                <Text fontSize="sm" color="orange.600" fontWeight="medium">
                  Tendance
                </Text>
                {getTrendIcon(stats.trend)}
              </HStack>
              <Heading size="2xl" color={getTrendColor(stats.trend)}>
                {getTrendText(stats.trend)}
              </Heading>
              <Text fontSize="sm" color="gray.500">
                Sur {stats.totalTests} tests
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>
    </CardBody>
  </MotionCard>
)}

        {/* Graphiques */}
        {loading ? (
          <Center py={20}>
            <VStack spacing={4}>
              <Progress size="lg" isIndeterminate colorScheme="purple" width="300px" />
              <Text color="gray.500">Chargement des données de performance...</Text>
            </VStack>
          </Center>
        ) : performanceData.length > 0 ? (
          <VStack spacing={8}>
            {/* Graphique Score */}
            <MotionCard
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              bg={cardBg}
              borderRadius="2xl"
              boxShadow="lg"
              w="100%"
            >
              <CardBody>
                <Chart
                  options={chartScoreData.options}
                  series={chartScoreData.series}
                  type="line"
                  height={350}
                />
              </CardBody>
            </MotionCard>

            {/* Graphique Accuracy */}
            <MotionCard
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              bg={cardBg}
              borderRadius="2xl"
              boxShadow="lg"
              w="100%"
            >
              <CardBody>
                <Chart
                  options={chartAccuracyData.options}
                  series={chartAccuracyData.series}
                  type="line"
                  height={350}
                />
              </CardBody>
            </MotionCard>

            {/* Détails des données */}
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              bg={cardBg}
              borderRadius="2xl"
              boxShadow="lg"
              w="100%"
            >
              <CardBody>
                <Heading size="md" mb={6} display="flex" alignItems="center" gap={2}>
                  <Icon as={FaEye} />
                  Détails des tests récents
                </Heading>
                
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {performanceData.slice(-3).reverse().map((item, index) => (
                    <Card key={index} borderWidth="1px" borderColor={borderColor}>
                      <CardBody>
                        <VStack spacing={3} align="start">
                          <Badge colorScheme="purple">
                            Test {performanceData.length - index}
                          </Badge>
                          <HStack w="100%" justify="space-between">
                            <Text fontWeight="medium">Score:</Text>
                            <Badge 
                              colorScheme={
                                item.score_percent >= 80 ? "green" :
                                item.score_percent >= 60 ? "blue" : "yellow"
                              }
                            >
                              {item.score_percent}%
                            </Badge>
                          </HStack>
                          <HStack w="100%" justify="space-between">
                            <Text fontWeight="medium">Précision:</Text>
                            <Badge 
                              colorScheme={
                                item.accuracy >= 80 ? "green" :
                                item.accuracy >= 60 ? "blue" : "yellow"
                              }
                            >
                              {item.accuracy}%
                            </Badge>
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              </CardBody>
            </MotionCard>
          </VStack>
        ) : lang_id ? (
          <Center py={20}>
            <VStack spacing={6} textAlign="center">
              <Icon as={FaChartLine} boxSize={20} color="gray.400" />
              <Box>
                <Heading size="lg" mb={2} color={textColor}>
                  Aucune donnée disponible
                </Heading>
                <Text color="gray.500" maxW="md">
                  Vous n'avez pas encore de données de performance pour la langue {lang_id.toUpperCase()}.
                  Passez quelques tests pour voir votre progression ici !
                </Text>
              </Box>
              <Button
                colorScheme="purple"
                size="lg"
                leftIcon={<FaFire />}
                onClick={() => window.location.href = `/quiz?lang=${lang_id}`}
              >
                Passer un test maintenant
              </Button>
            </VStack>
          </Center>
        ) : (
          <Center py={20}>
            <VStack spacing={6} textAlign="center">
              <Icon as={FaChartLine} boxSize={20} color="gray.400" />
              <Box>
                <Heading size="lg" mb={2} color={textColor}>
                  Analyse de Performance
                </Heading>
                <Text color="gray.500" maxW="md">
                  Sélectionnez une langue pour visualiser votre progression et analyser vos performances au fil du temps.
                </Text>
              </Box>
            </VStack>
          </Center>
        )}
      </Container>

      {/* Modal Paramètres */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>⚙️ Paramètres d'analyse</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Text fontWeight="medium">Type de graphique</Text>
                <Select defaultValue="line" size="sm" width="150px">
                  <option value="line">Ligne</option>
                  <option value="area">Surface</option>
                  <option value="bar">Barres</option>
                </Select>
              </HStack>
              <HStack justify="space-between">
                <Text fontWeight="medium">Animations</Text>
                <Badge colorScheme="green">Activées</Badge>
              </HStack>
              <HStack justify="space-between">
                <Text fontWeight="medium">Moyenne mobile</Text>
                <Select defaultValue="5" size="sm" width="150px">
                  <option value="3">3 tests</option>
                  <option value="5">5 tests</option>
                  <option value="10">10 tests</option>
                </Select>
              </HStack>
              <HStack justify="space-between">
                <Text fontWeight="medium">Rafraîchissement auto</Text>
                <Badge colorScheme="gray">Désactivé</Badge>
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

export default PerformanceGraph;