import {
  Box,
  Flex,
  Spacer,
  Link as ChakraLink,
  Text,
  Avatar,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom"; // Add this
import { 
  FaTrophy, 
  FaChartLine, 
  FaHome, 
  FaGamepad,
  FaUpload
} from "react-icons/fa";

const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const user = JSON.parse(localStorage.getItem("userInfo"));
  const navigate = useNavigate(); // Add this

  const links = [
    { name: "Test", path: "/quiz", icon: <FaGamepad /> },
    { name: "Performance", path: "/performance", icon: <FaChartLine /> },
    { name: "Upload Question", path: "/uploadQuestion", icon: <FaUpload /> },
    { name: "Leaderboard", path: "/leaderboard", icon: <FaTrophy /> },
  ];

  // Updated handleClick function
  const handleNavigation = (path) => {
    navigate(path);
    onClose(); // Close drawer on mobile
  };

  return (
    <Flex
      align="center"
      bg="rgba(255, 0, 0, 0.7)"
      p={4}
      color="white"
      position="fixed"
      top={0}
      left={0}
      width="100%"
      zIndex={1000}
      backdropFilter="saturate(180%) blur(10px)"
    >
      {/* Logo/Home */}
      <ChakraLink
        as="button"
        onClick={() => navigate("/")}
        _hover={{ textDecoration: "none", color: "pink.200" }}
        display="flex"
        alignItems="center"
        mr={4}
        background="none"
        border="none"
        color="white"
        cursor="pointer"
      >
        <FaHome style={{ marginRight: "8px" }} />
        <Text fontWeight="bold" fontSize="lg">
          QuizHub
        </Text>
      </ChakraLink>

      {/* Hamburger for mobile */}
      <IconButton
        icon={<HamburgerIcon />}
        aria-label="Open Menu"
        display={{ base: "block", md: "none" }}
        onClick={onOpen}
        variant="outline"
        colorScheme="whiteAlpha"
      />

      {/* Drawer for mobile menu */}
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay>
          <DrawerContent bg="rgba(255, 0, 0, 0.9)" color="white">
            <DrawerHeader borderBottomWidth="1px" position="relative">
              <Flex alignItems="center">
                <FaHome style={{ marginRight: "10px" }} />
                <Text fontWeight="bold">QuizHub Menu</Text>
              </Flex>
              <IconButton
                icon={<CloseIcon />}
                size="sm"
                aria-label="Close"
                onClick={onClose}
                position="absolute"
                top={2}
                right={2}
              />
            </DrawerHeader>
            <DrawerBody>
              <VStack align="start" spacing={4} pt={4}>
                {links.map((link) => (
                  <ChakraLink
                    key={link.path}
                    as="button"
                    onClick={() => handleNavigation(link.path)}
                    _hover={{ textDecoration: "none", color: "pink.200" }}
                    width="100%"
                    textAlign="left"
                    background="none"
                    border="none"
                    color="white"
                    cursor="pointer"
                    py={2}
                  >
                    <Flex align="center">
                      <Box mr={3}>{link.icon}</Box>
                      <Text fontSize="lg">{link.name}</Text>
                    </Flex>
                  </ChakraLink>
                ))}
                
                <ChakraLink
                  as="button"
                  onClick={() => handleNavigation("/profile")}
                  _hover={{ textDecoration: "none", color: "pink.200" }}
                  width="100%"
                  mt={4}
                  pt={4}
                  borderTop="1px solid rgba(255,255,255,0.2)"
                  background="none"
                  border="none"
                  color="white"
                  cursor="pointer"
                >
                  <Flex align="center">
                    <Avatar size="sm" name={user?.name || "User"} mr={3} />
                    <Box>
                      <Text fontWeight="bold">{user?.name || "Profile"}</Text>
                      {user?.xp && (
                        <Text fontSize="sm" opacity={0.8}>
                          Level {Math.floor((user.xp || 0) / 100) + 1} • {user.xp} XP
                        </Text>
                      )}
                    </Box>
                  </Flex>
                </ChakraLink>
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </DrawerOverlay>
      </Drawer>

      {/* Desktop menu */}
      <Flex display={{ base: "none", md: "flex" }} align="center" ml={4}>
        {links.map((link) => (
          <ChakraLink
            key={link.path}
            as="button"
            onClick={() => navigate(link.path)}
            mr={6}
            _hover={{ textDecoration: "none", color: "pink.200" }}
            background="none"
            border="none"
            color="white"
            cursor="pointer"
          >
            <Flex align="center">
              <Box mr={2}>{link.icon}</Box>
              <Text fontSize="md">{link.name}</Text>
            </Flex>
          </ChakraLink>
        ))}
      </Flex>

      <Spacer />

      {/* Profile for desktop */}
      <ChakraLink
        as="button"
        onClick={() => navigate("/profile")}
        display={{ base: "none", md: "flex" }}
        alignItems="center"
        _hover={{ textDecoration: "none", color: "pink.200" }}
        background="none"
        border="none"
        color="white"
        cursor="pointer"
      >
        <Avatar size="sm" name={user?.name || "User"} />
        <Box ml={2}>
          <Text fontWeight="medium">{user?.name || "Profile"}</Text>
          {user?.xp && (
            <Text fontSize="xs" opacity={0.8}>
              Level {Math.floor((user.xp || 0) / 100) + 1}
            </Text>
          )}
        </Box>
      </ChakraLink>
    </Flex>
  );
};

export default Navbar;