import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import PostState from "./createContext/Post/PostState";
import IsAuthStates from "./createContext/is-Auth/IsAuthStates";
import ChatState from "./createContext/Chat/ChatStates";
import ReelState from "./createContext/Reels/ReelState";
import SearchState from "./createContext/Search/SearchState";
import Register from "./components/Auth/Register/Register";
import Login from "./components/Auth/Login/Login";
import Dashboard from "./Dashboard";

function App() {
  return (
    <IsAuthStates>
      <PostState>
        <ChatState>
        <ReelState>
          <SearchState>
          <Router>
            <Routes>
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </Router>
          </SearchState>
          </ReelState>
        </ChatState>
      </PostState>
    </IsAuthStates>
  );
}

export default App;
