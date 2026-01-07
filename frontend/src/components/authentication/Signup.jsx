import React, { useState } from "react";
import { 
  FormControl, 
  FormLabel, 
  FormErrorMessage 
} from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { VStack } from "@chakra-ui/layout";
import { Button, useToast, Select } from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [password, setPassword] = useState("");
  const [isTeacher, setIsTeacher] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const toast = useToast();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!confirmpassword) {
      newErrors.confirmpassword = "Please confirm your password";
    } else if (password !== confirmpassword) {
      newErrors.confirmpassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitHandler = async () => {
    if (!validateForm()) {
      toast({
        title: "Please fix the errors in the form",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    setLoading(true);
    
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      console.log("📤 Sending registration request...", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        isTeacher,
        password: "***" // Ne pas log le mot de passe réel
      });

      // IMPORTANT: Vérifiez quelle est la bonne URL selon votre configuration backend
      // Essayez d'abord avec /api/users, sinon avec /user
      const { data } = await axios.post(
        "http://localhost:5000/api/user/", // Essayez d'abord cette URL
        { 
          name: name.trim(),
          email: email.trim().toLowerCase(),
          isTeacher, 
          password 
        },
        config
      );

      console.log("✅ Registration successful:", data);

      toast({
        title: "Registration Successful",
        description: "Welcome to Highway Quiz Academy!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

      localStorage.setItem("userInfo", JSON.stringify(data));
      
      // Naviguer sans recharger la page entière
      setTimeout(() => {
        navigate("/main", { replace: true });
      }, 1000);
      
    } catch (error) {
      console.error("❌ Registration error:", error);
      
      let errorMessage = "An error occurred";
      let errorDetails = "";
      
      if (error.response) {
        // Le serveur a répondu avec un statut d'erreur
        console.error("Response error:", error.response.data);
        console.error("Status:", error.response.status);
        
        if (error.response.status === 409 || error.response.status === 400) {
          errorMessage = error.response.data.error || error.response.data.message || "Email already exists";
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        
        errorDetails = error.response.data.error || "";
      } else if (error.request) {
        // La requête a été faite mais pas de réponse
        console.error("No response received:", error.request);
        errorMessage = "No response from server. Please check:";
        errorDetails = "1. Is the backend server running?\n2. Check terminal for errors\n3. Try: http://localhost:5000 in browser";
      } else {
        // Erreur lors de la configuration de la requête
        console.error("Request setup error:", error.message);
        errorMessage = "Request error";
        errorDetails = error.message;
      }
      
      toast({
        title: "Registration Failed",
        description: (
          <div>
            <div>{errorMessage}</div>
            {errorDetails && <div style={{ fontSize: '12px', marginTop: '5px' }}>{errorDetails}</div>}
          </div>
        ),
        status: "error",
        duration: 7000,
        isClosable: true,
        position: "bottom",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      submitHandler();
    }
  };

  return (
    <VStack spacing="4" onKeyPress={handleKeyPress}>
      <FormControl id="first-name" isRequired isInvalid={errors.name}>
        <FormLabel>Full Name</FormLabel>
        <Input
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors({...errors, name: null});
          }}
          autoComplete="name"
          bg="white"
          _focus={{
            borderColor: "purple.500",
            boxShadow: "0 0 0 1px purple.500"
          }}
        />
        <FormErrorMessage>{errors.name}</FormErrorMessage>
      </FormControl>
      
      <FormControl id="email" isRequired isInvalid={errors.email}>
        <FormLabel>Email Address</FormLabel>
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors({...errors, email: null});
          }}
          autoComplete="email"
          bg="white"
          _focus={{
            borderColor: "purple.500",
            boxShadow: "0 0 0 1px purple.500"
          }}
        />
        <FormErrorMessage>{errors.email}</FormErrorMessage>
      </FormControl>
      
      <FormControl isRequired>
        <FormLabel>Account Type</FormLabel>
        <Select
          value={isTeacher.toString()}
          onChange={(e) => {
            setIsTeacher(e.target.value === "true");
          }}
          bg="white"
          _focus={{
            borderColor: "purple.500",
            boxShadow: "0 0 0 1px purple.500"
          }}
        >
          <option value="false">Student (Learn and practice)</option>
          <option value="true">Teacher (Can upload questions)</option>
        </Select>
        <FormLabel fontSize="sm" color="gray.600" fontWeight="normal" mt={2}>
          {isTeacher 
            ? "You'll be able to create and manage questions" 
            : "You'll have access to all learning materials"}
        </FormLabel>
      </FormControl>
      
      <FormControl id="password" isRequired isInvalid={errors.password}>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Create a password (min. 6 characters)"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({...errors, password: null});
              if (errors.confirmpassword && e.target.value === confirmpassword) {
                setErrors({...errors, confirmpassword: null});
              }
            }}
            autoComplete="new-password"
            bg="white"
            _focus={{
              borderColor: "purple.500",
              boxShadow: "0 0 0 1px purple.500"
            }}
          />
          <InputRightElement width="4.5rem">
            <Button 
              h="1.75rem" 
              size="sm" 
              onClick={() => setShowPassword(!showPassword)}
              variant="ghost"
            >
              {showPassword ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
        <FormErrorMessage>{errors.password}</FormErrorMessage>
      </FormControl>
      
      <FormControl id="confirmpassword" isRequired isInvalid={errors.confirmpassword}>
        <FormLabel>Confirm Password</FormLabel>
        <InputGroup>
          <Input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={confirmpassword}
            onChange={(e) => {
              setConfirmpassword(e.target.value);
              if (errors.confirmpassword) setErrors({...errors, confirmpassword: null});
            }}
            autoComplete="new-password"
            bg="white"
            _focus={{
              borderColor: "purple.500",
              boxShadow: "0 0 0 1px purple.500"
            }}
          />
          <InputRightElement width="4.5rem">
            <Button 
              h="1.75rem" 
              size="sm" 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              variant="ghost"
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
        <FormErrorMessage>{errors.confirmpassword}</FormErrorMessage>
      </FormControl>
      
      <Button
        colorScheme="purple"
        width="100%"
        mt={4}
        onClick={submitHandler}
        isLoading={loading}
        loadingText="Creating account..."
        size="lg"
        _hover={{
          transform: 'translateY(-2px)',
          boxShadow: 'lg'
        }}
        transition="all 0.2s"
      >
        Create Account
      </Button>
    </VStack>
  );
};

export default Signup;