import React from "react";
import { Box, Heading, Text } from "@chakra-ui/react";
import Navbar from "../components/others/navbar";
import bgImage from "../images/main-bg.png";

const Mainpage = () => {
  return (
    <>
      <Navbar />
      <Box
        minH="100vh"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        bgImage={`url(${bgImage})`}
        bgSize="cover"
        bgPosition="center"
        bgRepeat="no-repeat"
        w="100%"
        p={4}
      >
        <Heading
          as="h1"
          fontSize={{ base: "4xl", md: "5xl" }}
          color="white"
          mb={4}
          textShadow="2px 2px 4px rgba(0,0,0,0.7)"
        >
          Welcome to Highway Quiz!
        </Heading>
        <Text
          fontSize={{ base: "xl", md: "2xl" }}
          color="white"
          mb={8}
          textShadow="1px 1px 3px rgba(0,0,0,0.6)"
          maxW="700px"
        >
          Test your knowledge on traffic rules, challenge yourself, and track your progress.
        </Text>
      </Box>
    </>
  );
};

export default Mainpage;
