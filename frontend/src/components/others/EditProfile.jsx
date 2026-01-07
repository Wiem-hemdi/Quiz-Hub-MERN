import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  useToast,
  Avatar,
  Icon,
  Box,
  Text,
  Switch,
  Divider,
  InputGroup,
  InputRightElement,
  FormErrorMessage
} from "@chakra-ui/react";
import axios from "axios";
import { FaCamera, FaEye, FaEyeSlash } from "react-icons/fa";

const EditProfile = ({ isOpen, onClose, userInfo, setUserInfo }) => {
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const toast = useToast();

  // États du formulaire
  const [formData, setFormData] = useState({
    name: userInfo?.name || "",
    email: userInfo?.email || "",
    isTeacher: userInfo?.isTeacher || false,
    profileImage: userInfo?.profileImage || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    
    // Validation du mot de passe seulement si un nouveau mot de passe est fourni
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = "Current password is required";
      }
      
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = "Password must be at least 6 characters";
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Effacer l'erreur quand l'utilisateur commence à taper
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
const handleSubmit = async () => {
  if (!validateForm()) {
    toast({
      title: "Please fix the errors",
      status: "warning",
      duration: 3000,
      isClosable: true,
      position: "top"
    });
    return;
  }

  setLoading(true);

  try {
    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
        "Content-Type": "application/json"
      }
    };

    // Préparer TOUTES les données en une seule requête
    const updateData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      isTeacher: formData.isTeacher
    };

    // Ajouter l'image de profil si fournie
    if (formData.profileImage) {
      updateData.profileImage = formData.profileImage;
    }

    // Ajouter les mots de passe SI fournis
    if (formData.newPassword) {
      updateData.currentPassword = formData.currentPassword;
      updateData.newPassword = formData.newPassword;
    }

    // Envoyer une SEULE requête
    console.log("📤 Sending update request:", updateData);
    
    const response = await axios.put(
      `http://localhost:5000/api/user/${userInfo._id}`,
      updateData,
      config
    );

    console.log("✅ Update response:", response.data);

    // Mettre à jour les informations locales
    const updatedUser = {
      ...userInfo,
      ...response.data.user,
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      isTeacher: formData.isTeacher
    };
    
    localStorage.setItem("userInfo", JSON.stringify(updatedUser));
    setUserInfo(updatedUser);

    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully",
      status: "success",
      duration: 5000,
      isClosable: true,
      position: "top"
    });

    onClose();

  } catch (error) {
    console.error("❌ Update error:", error.response?.data || error.message);
    
    let errorMessage = "Failed to update profile";
    if (error.response) {
      if (error.response.status === 400) {
        errorMessage = error.response.data.error || "Invalid data provided";
      } else if (error.response.status === 401) {
        errorMessage = "Unauthorized - Please login again";
      } else if (error.response.status === 403) {
        errorMessage = "You are not authorized to update this profile";
      } else if (error.response.status === 409) {
        errorMessage = "Email already in use";
      }
    }

    toast({
      title: "Update Failed",
      description: errorMessage,
      status: "error",
      duration: 5000,
      isClosable: true,
      position: "top"
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Profile</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Photo de profil */}
            <Box textAlign="center">
              <Avatar
                size="2xl"
                name={formData.name}
                src={formData.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.email}`}
                mb={4}
                mx="auto"
              />
              <Button
                leftIcon={<FaCamera />}
                size="sm"
                variant="outline"
                onClick={() => {
                  const imageUrl = prompt("Enter image URL:");
                  if (imageUrl) {
                    setFormData(prev => ({ ...prev, profileImage: imageUrl }));
                  }
                }}
              >
                Change Avatar
              </Button>
            </Box>

            <Divider />

            {/* Informations de base */}
            <VStack spacing={4}>
              <FormControl isRequired isInvalid={errors.name}>
                <FormLabel>Full Name</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={errors.email}>
                <FormLabel>Email Address</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <HStack justify="space-between">
                  <FormLabel mb="0">Teacher Account</FormLabel>
                  <Switch
                    name="isTeacher"
                    isChecked={formData.isTeacher}
                    onChange={handleInputChange}
                    colorScheme="purple"
                  />
                </HStack>
                <Text fontSize="sm" color="gray.500" mt={1}>
                  {formData.isTeacher 
                    ? "You can create and manage quizzes" 
                    : "You can only take quizzes"}
                </Text>
              </FormControl>
            </VStack>

            <Divider />

            {/* Changement de mot de passe */}
            <Box>
              <Text fontWeight="bold" mb={4}>Change Password (Optional)</Text>
              <VStack spacing={4}>
                <FormControl isInvalid={errors.currentPassword}>
                  <FormLabel>Current Password</FormLabel>
                  <InputGroup>
                    <Input
                      name="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      placeholder="Enter current password"
                    />
                    <InputRightElement>
                      <Button
                        size="sm"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        variant="ghost"
                      >
                        {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>{errors.currentPassword}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.newPassword}>
                  <FormLabel>New Password</FormLabel>
                  <InputGroup>
                    <Input
                      name="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      placeholder="Enter new password (min 6 characters)"
                    />
                    <InputRightElement>
                      <Button
                        size="sm"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        variant="ghost"
                      >
                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>{errors.newPassword}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.confirmPassword}>
                  <FormLabel>Confirm New Password</FormLabel>
                  <InputGroup>
                    <Input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm new password"
                    />
                    <InputRightElement>
                      <Button
                        size="sm"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        variant="ghost"
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                </FormControl>
              </VStack>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="purple"
            onClick={handleSubmit}
            isLoading={loading}
            loadingText="Saving..."
          >
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditProfile;