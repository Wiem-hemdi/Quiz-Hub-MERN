import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  FormControl,
  FormLabel,
  Input,
  Select,
  Text,
  Divider,
  Button,
  Center,
  useToast,
  Heading,
  VStack,
  HStack,
  Flex,
  Card,
  CardBody,
  CardHeader,
  Icon,
  useColorModeValue,
  Textarea,
  Image,
  Badge,
  Progress,
  Alert,
  AlertIcon,
  RadioGroup,
  Radio,
  Stack,
  ScaleFade,
  Tooltip,
  SimpleGrid,
  Avatar,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from "@chakra-ui/react";
import axios from "axios";
import Navbar from "../others/navbar";
import {
  FaUpload,
  FaQuestionCircle,
  FaImage,
  FaGlobe,
  FaCheckCircle,
  FaPlus,
  FaLightbulb,
  FaRobot,
  FaChartLine,
  FaBook,
  FaCog,
  FaPalette,
  FaMagic,
  FaBrain,
  FaGraduationCap,
  FaAward,
  FaRocket,
  FaEye,
  FaTrash
} from "react-icons/fa";
import { motion } from "framer-motion";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

function UploadQuestion() {
  const [testNames, setTestNames] = useState([]);
  const [langId, setLangId] = useState("");
  const [newTestName, setNewTestName] = useState("");
  const [category, setCategory] = useState("");
  const [desc, setDesc] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("basic");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
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

  useEffect(() => {
    const fetchTestNames = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const res = await axios.get("http://localhost:5000/quiz/test-names", config);
        setTestNames(res.data);
      } catch (err) {
        console.error("Error fetching test names:", err);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les tests",
          status: "error",
          duration: 3000,
        });
      }
    };
    fetchTestNames();
  }, [userInfo.token, toast]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validation
    const validationErrors = [];
    if (!langId || (langId === "new" && !newTestName)) validationErrors.push("Test name");
    if (!category) validationErrors.push("Language");
    if (!desc) validationErrors.push("Question");
    if (options.some(opt => !opt.trim())) validationErrors.push("All options");
    if (!correctAnswer) validationErrors.push("Correct answer");

    if (validationErrors.length > 0) {
      toast({
        title: "Champs manquants",
        description: `Veuillez remplir : ${validationErrors.join(", ")}`,
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    setProgress(0);

    const simulateProgress = () => {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);
      return interval;
    };

    const progressInterval = simulateProgress();

    try {
      const formData = new FormData();
      formData.append("lang_id", langId === "new" ? newTestName : langId);
      formData.append("category", category);
      formData.append("desc", desc);
      formData.append("option1", options[0]);
      formData.append("option2", options[1]);
      formData.append("option3", options[2]);
      formData.append("option4", options[3]);
      formData.append("correct_answer", correctAnswer);
      if (imageFile) formData.append("image", imageFile);

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
        },
      };

      const res = await axios.post("http://localhost:5000/quiz/upload", formData, config);
      
      clearInterval(progressInterval);
      setProgress(100);

      if (res.data.success) {
        toast({
          title: "✅ Question ajoutée !",
          description: "La question a été enregistrée avec succès",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top-right"
        });

        // Réinitialiser le formulaire
        setDesc("");
        setOptions(["", "", "", ""]);
        setCorrectAnswer("");
        setImageFile(null);
        setImagePreview(null);
        setLangId("");
        setNewTestName("");
        setCategory("");

        // Recharger les tests disponibles
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const res = await axios.get("http://localhost:5000/quiz/test-names", config);
        setTestNames(res.data);
      }

    } catch (err) {
      clearInterval(progressInterval);
      console.error(err);
      
      toast({
        title: "❌ Échec de l'upload",
        description: err.response?.data?.message || "Erreur lors de l'enregistrement",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right"
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const calculateFormCompletion = () => {
    let completed = 0;
    const total = 7;
    
    if (langId && langId !== "") completed++;
    
    if (langId === "new") {
      if (newTestName && newTestName.trim() !== "") completed++;
    } else {
      completed++;
    }
    
    if (category && category !== "") completed++;
    
    if (desc && desc.trim() !== "") completed++;
    
    if (options.every(opt => opt && opt.trim() !== "")) completed++;
    
    if (correctAnswer !== "" && correctAnswer !== undefined) completed++;
    
    completed++;
    
    return Math.round((completed / total) * 100);
  };

  const formCompletion = calculateFormCompletion();

  return (
    <>
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
            <Flex alignItems="center" gap={6}>
              <Avatar
                size="xl"
                name={userInfo.name}
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo.email}`}
                border="4px solid"
                borderColor="whiteAlpha.400"
                boxShadow="xl"
              />
              <VStack align="start" spacing={3}>
                <Heading size="2xl" fontWeight="bold">
                  Créateur de Questions
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
                    <Icon as={FaGraduationCap} mr={2} />
                    {testNames.length} tests disponibles
                  </Text>
                </HStack>
              </VStack>
            </Flex>
            
            <Tooltip label="Paramètres avancés">
              <Button
                leftIcon={<FaCog />}
                colorScheme="whiteAlpha"
                variant="outline"
                size="lg"
                onClick={onOpen}
                _hover={{ bg: "whiteAlpha.200" }}
              >
                Options
              </Button>
            </Tooltip>
          </Flex>
        </Container>
      </Box>

      <Container maxW="7xl" py={8} px={{ base: 4, lg: 8 }}>
        {/* Navigation Tabs */}
        <Tabs variant="soft-rounded" colorScheme="purple" mb={8}>
          <TabList mb={6} bg={cardBg} p={2} borderRadius="xl" boxShadow="sm">
            <Tab onClick={() => setActiveTab("basic")}>
              <Icon as={FaBook} mr={2} />
              Formulaire basique
            </Tab>
            
          </TabList>

          <TabPanels>
            {/* Panel 1: Formulaire basique */}
            <TabPanel p={0}>
              {/* Progression */}
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                bg={cardBg}
                borderRadius="2xl"
                boxShadow="lg"
                mb={8}
                borderLeft="4px solid"
                borderLeftColor="purple.500"
              >
                <CardBody>
                  <Flex justifyContent="space-between" alignItems="center" mb={4}>
                    <HStack>
                      <Icon as={FaChartLine} color="purple.500" boxSize={6} />
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold" color={textColor} fontSize="lg">
                          Progression du formulaire
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {formCompletion === 100 ? "✅ Prêt à soumettre !" : "Complétez tous les champs"}
                        </Text>
                      </VStack>
                    </HStack>
                    <Badge 
                      colorScheme={formCompletion === 100 ? "green" : "blue"} 
                      fontSize="xl"
                      px={4}
                      py={1}
                      borderRadius="full"
                    >
                      {formCompletion}%
                    </Badge>
                  </Flex>
                  <Progress 
                    value={formCompletion} 
                    colorScheme={formCompletion === 100 ? "green" : "purple"}
                    size="lg" 
                    borderRadius="full"
                    hasStripe
                    isAnimated={formCompletion < 100}
                  />
                </CardBody>
              </MotionCard>

              {/* Formulaire principal */}
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                bg={cardBg}
                borderRadius="2xl"
                boxShadow="lg"
                overflow="hidden"
              >
                <CardHeader 
                  bg={useColorModeValue("gray.50", "gray.700")}
                  borderBottom="1px solid"
                  borderColor={borderColor}
                  py={6}
                >
                  <Flex alignItems="center" gap={3}>
                    <Center w={10} h={10} borderRadius="lg" bg="purple.100">
                      <Icon as={FaQuestionCircle} color="purple.500" boxSize={5} />
                    </Center>
                    <VStack align="start" spacing={1}>
                      <Heading size="lg" color={textColor}>Nouvelle Question</Heading>
                      <Text fontSize="sm" color="gray.500">Remplissez tous les champs requis</Text>
                    </VStack>
                  </Flex>
                </CardHeader>

                <CardBody p={8}>
                  <form onSubmit={handleSubmit}>
                    <VStack spacing={8} align="stretch">
                      
                      {/* Section 1 : Test et Langue */}
                      <Box>
                        <Heading size="md" mb={6} color={textColor} display="flex" alignItems="center" gap={3}>
                          <Center w={8} h={8} borderRadius="lg" bg="blue.100">
                            <Icon as={FaBook} color="blue.500" />
                          </Center>
                          <span>1. Sélection du Test</span>
                        </Heading>
                        
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                          {/* Test existant */}
                          <FormControl isRequired>
                            <FormLabel display="flex" alignItems="center" gap={2} mb={2}>
                              <Icon as={FaBook} />
                              <Text fontWeight="medium">Test</Text>
                            </FormLabel>
                            <Select 
                              value={langId} 
                              onChange={(e) => setLangId(e.target.value)}
                              placeholder="Choisir un test existant"
                              size="lg"
                              focusBorderColor={accentColor}
                              borderColor={borderColor}
                              bg={useColorModeValue("white", "gray.700")}
                            >
                              {testNames.map((name, idx) => (
                                <option key={idx} value={name}>{name}</option>
                              ))}
                              <option value="new">➕ Créer un nouveau test</option>
                            </Select>
                          </FormControl>

                          {/* Nouveau test */}
                          {langId === "new" && (
                            <FormControl isRequired>
                              <FormLabel display="flex" alignItems="center" gap={2} mb={2}>
                                <Icon as={FaPlus} />
                                <Text fontWeight="medium">Nouveau test</Text>
                              </FormLabel>
                              <Input
                                type="text"
                                value={newTestName}
                                onChange={(e) => setNewTestName(e.target.value)}
                                placeholder="Nom du nouveau test"
                                size="lg"
                                focusBorderColor={accentColor}
                                borderColor={borderColor}
                              />
                            </FormControl>
                          )}

                          {/* Langue */}
                          <FormControl isRequired>
                            <FormLabel display="flex" alignItems="center" gap={2} mb={2}>
                              <Icon as={FaGlobe} />
                              <Text fontWeight="medium">Langue</Text>
                            </FormLabel>
                            <Select
                              value={category}
                              onChange={(e) => setCategory(e.target.value)}
                              placeholder="Sélectionner la langue"
                              size="lg"
                              focusBorderColor={accentColor}
                              borderColor={borderColor}
                              bg={useColorModeValue("white", "gray.700")}
                            >
                              <option value="French">🇫🇷 Français</option>
                              <option value="Arabic">🇸🇦 Arabe</option>
                              <option value="English">🇬🇧 Anglais</option>
                            </Select>
                          </FormControl>
                        </SimpleGrid>
                      </Box>

                      <Divider />

                      {/* Section 2 : Question */}
                      <Box>
                        <Heading size="md" mb={6} color={textColor} display="flex" alignItems="center" gap={3}>
                          <Center w={8} h={8} borderRadius="lg" bg="green.100">
                            <Icon as={FaQuestionCircle} color="green.500" />
                          </Center>
                          <span>2. La Question</span>
                        </Heading>
                        
                        <FormControl isRequired mb={6}>
                          <FormLabel>Texte de la question</FormLabel>
                          <Textarea
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            placeholder="Entrez votre question ici..."
                            size="lg"
                            rows={4}
                            focusBorderColor={accentColor}
                            borderColor={borderColor}
                            bg={useColorModeValue("white", "gray.700")}
                            _hover={{ borderColor: accentColor }}
                          />
                        </FormControl>

                        {/* Upload d'image */}
                        <FormControl mb={6}>
                          <FormLabel display="flex" alignItems="center" gap={2} mb={3}>
                            <Center w={8} h={8} borderRadius="lg" bg="orange.100">
                              <Icon as={FaImage} color="orange.500" />
                            </Center>
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="medium">Image (optionnelle)</Text>
                              <Text fontSize="sm" color="gray.500">
                                Formats supportés: JPG, PNG, GIF (max 5MB)
                              </Text>
                            </VStack>
                          </FormLabel>
                          <Flex direction={{ base: "column", md: "row" }} gap={6}>
                            <Box flex={1}>
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                size="lg"
                                p={2}
                                borderColor={borderColor}
                                _hover={{ borderColor: accentColor }}
                              />
                            </Box>
                            
                            {imagePreview && (
                              <Box flex={1}>
                                <Flex alignItems="center" justifyContent="space-between" mb={2}>
                                  <Text fontWeight="medium">Aperçu :</Text>
                                  <Button
                                    size="sm"
                                    colorScheme="red"
                                    variant="ghost"
                                    leftIcon={<FaTrash />}
                                    onClick={() => {
                                      setImageFile(null);
                                      setImagePreview(null);
                                    }}
                                  >
                                    Supprimer
                                  </Button>
                                </Flex>
                                <Image
                                  src={imagePreview}
                                  alt="Preview"
                                  maxH="200px"
                                  borderRadius="lg"
                                  border="2px solid"
                                  borderColor={borderColor}
                                />
                              </Box>
                            )}
                          </Flex>
                        </FormControl>
                      </Box>

                      <Divider />

                      {/* Section 3 : Options */}
                      <Box>
                        <Heading size="md" mb={6} color={textColor} display="flex" alignItems="center" gap={3}>
                          <Center w={8} h={8} borderRadius="lg" bg="yellow.100">
                            <Icon as={FaLightbulb} color="yellow.500" />
                          </Center>
                          <span>3. Options de réponse</span>
                        </Heading>
                        
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                          {options.map((option, index) => (
                            <MotionBox
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <FormControl isRequired>
                                <FormLabel display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                                  <HStack>
                                    <Center w={6} h={6} borderRadius="md" bg="gray.100">
                                      <Text fontWeight="bold">{index + 1}</Text>
                                    </Center>
                                    <Text fontWeight="medium">Option {index + 1}</Text>
                                  </HStack>
                                  {parseInt(correctAnswer) === index && (
                                    <Badge colorScheme="green" fontSize="sm">
                                      <Icon as={FaCheckCircle} mr={1} />
                                      Correcte
                                    </Badge>
                                  )}
                                </FormLabel>
                                <Input
                                  type="text"
                                  value={option}
                                  onChange={(e) => handleOptionChange(index, e.target.value)}
                                  placeholder={`Texte de l'option ${index + 1}`}
                                  size="lg"
                                  focusBorderColor={parseInt(correctAnswer) === index ? "green.500" : accentColor}
                                  borderColor={parseInt(correctAnswer) === index ? "green.300" : borderColor}
                                  bg={parseInt(correctAnswer) === index ? "green.50" : useColorModeValue("white", "gray.700")}
                                  _hover={{ borderColor: parseInt(correctAnswer) === index ? "green.400" : accentColor }}
                                />
                              </FormControl>
                            </MotionBox>
                          ))}
                        </SimpleGrid>
                      </Box>

                      <Divider />

                      {/* Section 4 : Réponse correcte */}
                      <Box>
                        <Heading size="md" mb={6} color={textColor} display="flex" alignItems="center" gap={3}>
                          <Center w={8} h={8} borderRadius="lg" bg="red.100">
                            <Icon as={FaCheckCircle} color="red.500" />
                          </Center>
                          <span>4. Réponse correcte</span>
                        </Heading>
                        
                        <FormControl isRequired>
                          <FormLabel mb={4}>Sélectionnez la réponse correcte</FormLabel>
                          <RadioGroup value={correctAnswer} onChange={setCorrectAnswer}>
                            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                              {options.map((option, index) => (
                                <Card 
                                  key={index}
                                  borderWidth="2px"
                                  borderColor={correctAnswer === String(index) ? "green.500" : borderColor}
                                  bg={correctAnswer === String(index) ? "green.50" : cardBg}
                                  cursor="pointer"
                                  onClick={() => setCorrectAnswer(String(index))}
                                  _hover={{ 
                                    borderColor: correctAnswer === String(index) ? "green.500" : accentColor,
                                    transform: "translateY(-2px)",
                                    boxShadow: "md"
                                  }}
                                  transition="all 0.2s"
                                >
                                  <CardBody>
                                    <Radio value={String(index)} isChecked={correctAnswer === String(index)}>
                                      <Flex align="center" justify="space-between" w="100%">
                                        <HStack>
                                          <Center w={6} h={6} borderRadius="md" bg={correctAnswer === String(index) ? "green.100" : "gray.100"}>
                                            <Text fontWeight="bold">{index + 1}</Text>
                                          </Center>
                                          <Text fontWeight={correctAnswer === String(index) ? "bold" : "medium"}>
                                            Option {index + 1}
                                          </Text>
                                        </HStack>
                                        {correctAnswer === String(index) && (
                                          <Icon as={FaCheckCircle} color="green.500" />
                                        )}
                                      </Flex>
                                    </Radio>
                                    {option && (
                                      <Text fontSize="sm" color="gray.600" mt={2} noOfLines={2}>
                                        {option}
                                      </Text>
                                    )}
                                  </CardBody>
                                </Card>
                              ))}
                            </SimpleGrid>
                          </RadioGroup>
                        </FormControl>
                      </Box>

                      {/* Bouton de soumission */}
                      <Box pt={8}>
                        {isSubmitting && (
                          <Alert status="info" mb={6} borderRadius="lg" variant="left-accent">
                            <AlertIcon />
                            <Box flex={1}>
                              <Text fontWeight="bold">Enregistrement en cours...</Text>
                              <Progress value={progress} size="sm" mt={2} />
                            </Box>
                          </Alert>
                        )}
                        
                        <Center>
                          <Tooltip 
                            label={formCompletion < 100 ? "Veuillez remplir tous les champs requis" : "Cliquez pour ajouter la question"}
                            hasArrow
                          >
                            <Button
                              type="submit"
                              colorScheme="purple"
                              size="lg"
                              px={12}
                              py={6}
                              fontSize="lg"
                              leftIcon={<FaUpload />}
                              isLoading={isSubmitting}
                              loadingText="Enregistrement..."
                              isDisabled={formCompletion < 100 || isSubmitting}
                              bgGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                              _hover={{
                                bgGradient: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                                transform: "translateY(-2px)",
                                boxShadow: "xl"
                              }}
                              _active={{
                                transform: "translateY(0)"
                              }}
                              transition="all 0.3s"
                            >
                              Ajouter la Question
                            </Button>
                          </Tooltip>
                        </Center>
                      </Box>
                    </VStack>
                  </form>
                </CardBody>
              </MotionCard>
            </TabPanel>

          </TabPanels>
        </Tabs>

        {/* Conseils et informations */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mt={8}>
          <Card bg={cardBg} borderRadius="xl" boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <HStack mb={4}>
                <Center w={10} h={10} borderRadius="lg" bg="orange.100">
                  <Icon as={FaLightbulb} color="orange.500" />
                </Center>
                <Heading size="sm">💡 Conseils de création</Heading>
              </HStack>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm">• Formulez des questions claires et précises</Text>
                <Text fontSize="sm">• Les options doivent être plausibles</Text>
                <Text fontSize="sm">• Une seule réponse clairement correcte</Text>
                <Text fontSize="sm">• Vérifiez l'orthographe et la grammaire</Text>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderRadius="xl" boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <HStack mb={4}>
                <Center w={10} h={10} borderRadius="lg" bg="blue.100">
                  <Icon as={FaRobot} color="blue.500" />
                </Center>
                <Heading size="sm">🤖 Qualité IA</Heading>
              </HStack>
              <Text fontSize="sm">
                Les questions de qualité contribuent à un meilleur apprentissage grâce à notre assistant IA qui s'en sert pour fournir des explications détaillées.
              </Text>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderRadius="xl" boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <HStack mb={4}>
                <Center w={10} h={10} borderRadius="lg" bg="purple.100">
                  <Icon as={FaRocket} color="purple.500" />
                </Center>
                <Heading size="sm">🚀 Impact pédagogique</Heading>
              </HStack>
              <Text fontSize="sm">
                Chaque question que vous créez aide des centaines d'apprenants à progresser dans leurs compétences linguistiques.
              </Text>
            </CardBody>
          </Card>
        </SimpleGrid>
      </Container>

      {/* Modal Paramètres */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>⚙️ Paramètres avancés</ModalHeader>
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Text>Mode expert</Text>
                <Icon as={FaBrain} />
              </HStack>
              <HStack justify="space-between">
                <Text>Thème personnalisé</Text>
                <Icon as={FaPalette} />
              </HStack>
              <HStack justify="space-between">
                <Text>Validation automatique</Text>
                <Icon as={FaCheckCircle} />
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
    </>
  );
}

export default UploadQuestion;