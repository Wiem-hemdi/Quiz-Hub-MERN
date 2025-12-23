import { React, useEffect } from "react";
import { Container, Box, Text, Tab, Tabs, TabList, TabPanels, TabPanel, Stack } from "@chakra-ui/react";
import Login from "../components/authentication/Login";
import Signup from "../components/authentication/Signup";
import { useNavigate } from "react-router-dom";

const Homepage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (user) navigate("/main");
  }, [navigate]);

  return (
    <Container maxW="6xl" minH="100vh" display="flex" alignItems="center">
      <Stack spacing={6} ml={{ base: 0, md: "60%" }} w={{ base: "100%", md: "40%" }}>
        <Box bg="white" w="100%" p={4} borderRadius="lg" borderWidth="2px" textAlign="center">
          <Text fontSize={{ base: "3xl", md: "4xl" }} fontFamily="Work sans" fontWeight="bold">
            Highway Quiz
          </Text>
        </Box>

        <Box bg="white" w="100%" p={4} borderRadius="lg" borderWidth="1px">
          <Tabs variant="soft-rounded">
            <TabList mb="1em">
              <Tab width="50%">Login</Tab>
              <Tab width="50%">Sign Up</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <Login />
              </TabPanel>
              <TabPanel>
                <Signup />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Stack>
    </Container>
  );
};

export default Homepage;
