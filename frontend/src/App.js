import "./App.css";
import { Route, Routes } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import Homepage from "./pages/Homepage";
import Mainpage from "./pages/Mainpage";
import TestPage from "./components/others/testpage";
import ProfilePage from "./components/others/profile";
import LeaderboardPage from "./components/others/leaderboard";
import UploadQuestionPage from "./components/others/upload";
import PerformanceGraph from "./components/others/performance";

function App() {
  return (
    <ChakraProvider>
      <Routes>
        <Route path="/" element={<div className="App home-bg"><Homepage /></div>} />
        <Route path="/main" element={<div className="App main-bg"><Mainpage /></div>} />
        <Route path="/testpage" element={<div className="App test-bg"><TestPage /></div>} />
        <Route path="/profile" element={<div className="App profile-bg"><ProfilePage /></div>} />
        <Route path="/leaderboard" element={<div className="App leaderboard-bg"><LeaderboardPage /></div>} />
        <Route path="/uploadQuestion" element={<div className="App upload-bg"><UploadQuestionPage /></div>} />
        <Route path="/performance" element={<div className="App performance-bg"><PerformanceGraph /></div>} />
      </Routes>
    </ChakraProvider>
  );
}

export default App;
