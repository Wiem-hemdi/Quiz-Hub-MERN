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
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../others/navbar";

function UploadQuestion() {
  const [testNames, setTestNames] = useState([]);
  const [langId, setLangId] = useState(""); // selected or new test
  const [newTestName, setNewTestName] = useState("");
  const [category, setCategory] = useState("");
  const [desc, setDesc] = useState("");
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [option3, setOption3] = useState("");
  const [option4, setOption4] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const toast = useToast();

  useEffect(() => {
    const fetchTestNames = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const res = await axios.get("http://localhost:5000/quiz/test-names", config);
        setTestNames(res.data); // tableau de strings
      } catch (err) {
        console.error("Error fetching test names:", err);
      }
    };
    fetchTestNames();
  }, [userInfo.token]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      (langId === "" || (langId === "new" && newTestName === "")) ||
      !category || !desc || !option1 || !option2 || !option3 || !option4 || correctAnswer === ""
    ) {
      toast({ title: "Fill all fields", status: "error", duration: 5000, isClosable: true });
      return;
    }

    const formData = new FormData();
    formData.append("lang_id", langId === "new" ? newTestName : langId); // test existant ou nouveau
    formData.append("category", category); // Language
    formData.append("desc", desc);
    formData.append("option1", option1);
    formData.append("option2", option2);
    formData.append("option3", option3);
    formData.append("option4", option4);
    formData.append("correct_answer", correctAnswer); // string "0", "1", "2", "3"
    if (imageFile) formData.append("image", imageFile);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
          "Content-Type": "multipart/form-data",
        },
      };
      const res = await axios.post("http://localhost:5000/quiz/upload", formData, config);
      if (res.data.success) {
        toast({ title: "Question Uploaded", status: "success", duration: 5000, isClosable: true });
        // Reset fields
        setDesc(""); setOption1(""); setOption2(""); setOption3(""); setOption4("");
        setCorrectAnswer(""); setImageFile(null); setLangId(""); setNewTestName(""); setCategory("");
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Upload failed", status: "error", duration: 5000, isClosable: true });
    }
  };

  return (
    <>
      <Navbar />
      <Container background="white" maxW="2xl" py={8} mt="5rem" mb="2rem" rounded="lg">
        <Text textAlign="center" fontSize="2xl" fontWeight="bold" color="#06cf60" pb={6}>
          Add A Question
        </Text>
        <Divider />
        <Box p={4} display="flex" justifyContent="center">
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <FormControl mb={4} isRequired>
              <FormLabel>Test Name</FormLabel>
              <Select value={langId} onChange={(e) => setLangId(e.target.value)} placeholder="Select Test">
                {testNames.map((name, idx) => (
                  <option key={idx} value={name}>{name}</option>
                ))}
                <option value="new">Create New Test</option>
              </Select>
            </FormControl>

            {langId === "new" && (
              <FormControl mb={4} isRequired>
                <FormLabel>New Test Name</FormLabel>
                <Input type="text" value={newTestName} onChange={(e) => setNewTestName(e.target.value)} />
              </FormControl>
            )}

            <FormControl mb={4} isRequired>
              <FormLabel>Question</FormLabel>
              <Input type="text" value={desc} onChange={(e) => setDesc(e.target.value)} />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Question Image (optional)</FormLabel>
              <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
            </FormControl>

            {[option1, option2, option3, option4].map((opt, i) => (
              <FormControl key={i} mb={4} isRequired>
                <FormLabel>Option {i + 1}</FormLabel>
                <Input
                  type="text"
                  value={opt}
                  onChange={(e) => [setOption1, setOption2, setOption3, setOption4][i](e.target.value)}
                />
              </FormControl>
            ))}

            <FormControl mb={4} isRequired>
              <FormLabel>Language</FormLabel>
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Arabic">Arabic</option>
                <option value="French">French</option>
                <option value="English">English</option>
              </Select>
            </FormControl>

            <FormControl mb={4} isRequired>
              <FormLabel>Correct Answer</FormLabel>
              <Select value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)}>
                <option value="0">Option 1</option>
                <option value="1">Option 2</option>
                <option value="2">Option 3</option>
                <option value="3">Option 4</option>
              </Select>
            </FormControl>

            <Center>
              <Button type="submit" colorScheme="blue" mt={4} p={5}>Add</Button>
            </Center>
          </form>
        </Box>
      </Container>
    </>
  );
}

export default UploadQuestion;
