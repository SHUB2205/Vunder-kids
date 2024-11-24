import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import PostState from "./createContext/Post/PostState";
import IsAuthStates from "./createContext/is-Auth/IsAuthStates";
import ChatState from "./createContext/Chat/ChatStates";
import RegisterStates from "./createContext/Register/RegisterStates";
import Register from "./components/Auth/Register/Register";
import Login from "./components/Auth/Login/Login";
import About from './components/Auth/Register/About/About'
import Passion from './components/Auth/Register/Passion/Passion'
import UploadPicture from "./components/Auth/Register/UploadPicture/UploadPicture";
import Dashboard from "./Dashboard";
function App() {
  return (
    <RegisterStates>

    <IsAuthStates>
      <PostState>
        {/* <ChatState> */}
          <Router>
            <Routes>
              <Route path="/register" element={<Register />} />
              <Route path="/register/about" element={<About />} />
              <Route path="/register/passion" element={<Passion />} />
              <Route path="/register/uploadPicture" element={<UploadPicture />} />
              <Route path="/login" element={<Login />} />
              {/* <Route path="*" element={<Dashboard />} /> */}
            </Routes>
          </Router>
        {/* </ChatState> */}
      </PostState>
    </IsAuthStates>
    </RegisterStates>
  );
}

export default App;
