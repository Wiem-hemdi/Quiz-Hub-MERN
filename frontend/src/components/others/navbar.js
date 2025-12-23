import React from "react";
import {
  Box,
  Flex,
  Spacer,
  Link,
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

const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const user = JSON.parse(localStorage.getItem("userInfo"));

  const links = [
    { name: "Give Test", href: "/testpage" },
    { name: "Performance", href: "/performance" },
    { name: "Upload Question", href: "/uploadQuestion" },
    { name: "Leaderboard", href: "/leaderboard" },
  ];

  return (
    <Flex
      align="center"
      bg="rgba(255, 0, 0, 0.7)" // transparent red
      p={4}
      color="white"
      position="fixed"
      top={0}
      left={0}
      width="100%"
      zIndex={1000}
      backdropFilter="saturate(180%) blur(10px)" // nice glass effect
    >
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
              <Text fontWeight="bold">Menu</Text>
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
              <VStack align="start" spacing={4}>
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    _hover={{ textDecoration: "none", color: "pink.200" }}
                  >
                    <Text fontSize="lg">{link.name}</Text>
                  </Link>
                ))}
                <Link
                  href="/profile"
                  _hover={{ textDecoration: "none", color: "pink.200" }}
                >
                  <Flex align="center">
                    <Avatar size="sm" name={user?.name || "User"} />
                    <Text ml={2}>Profile</Text>
                  </Flex>
                </Link>
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </DrawerOverlay>
      </Drawer>

      {/* Desktop menu */}
      <Flex display={{ base: "none", md: "flex" }} align="center">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            mr={6}
            _hover={{ textDecoration: "none", color: "pink.200" }}
          >
            {link.name}
          </Link>
        ))}
      </Flex>

      <Spacer />

      {/* Profile for desktop */}
      <Link
        href="/profile"
        display={{ base: "none", md: "flex" }}
        alignItems="center"
        _hover={{ textDecoration: "none", color: "pink.200" }}
      >
        <Avatar size="sm" name={user?.name || "User"} />
        <Text ml={2}>{user?.name || "Profile"}</Text>
      </Link>
    </Flex>
  );
};

export default Navbar;
