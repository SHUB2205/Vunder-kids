import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PostState from "./createContext/Post/PostState";
import IsAuthStates from "./createContext/is-Auth/IsAuthStates";
import ChatState from "./createContext/Chat/ChatStates";
import Register from "./components/Auth/Register/Register";
import Login from "./components/Auth/Login/Login";
import About from "./components/Auth/Register/About/About";
import Passion from "./components/Auth/Register/Passion/Passion";
import UploadPicture from "./components/Auth/Register/UploadPicture/UploadPicture";
import Dashboard from "./Dashboard";
import RegisterStates from "./createContext/Register/RegisterStates";
import ReelState from './createContext/Reels/ReelState';
import SearchState from './createContext/Search/SearchState';
import WaitingScreen from './components/Auth/Register/WaitingScreen/WaitingScreen';
function App() {
  return (
    <RegisterStates>
      <IsAuthStates>
        <PostState>
          {/* <ChatState> */}
       
            <ReelState>
              <SearchState>
                <Router>
                  <Routes>
                    <Route path="/register" element={<Register />} />
                    <Route path="/register/about" element={<About />} />
                    <Route path="/register/passion" element={<Passion />} />
                    <Route
                      path="/register/uploadPicture"
                      element={<UploadPicture />}
                    />
                    <Route path='/register/waiting' element={<WaitingScreen/>}/>
                    <Route path="/login" element={<Login />} />
                    {/* <Route path="*" element={<Dashboard />} /> */}
                  </Routes>
                </Router>

               
              </SearchState>
            </ReelState>
          {/* </ChatState> */}
        </PostState>
      </IsAuthStates>
    </RegisterStates>
  );
}

export default App;
