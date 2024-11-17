import "./App.css";
import { BrowserRouter as Router, Route, Routes ,Navigate} from "react-router-dom";
import LeftSidebar from "./components/LeftSlidebar/LeftSidebar";
import MainContent from "./components/Home/MainContent";
import RightSidebar from "./components/RightSidebar/RightSidebar";
import Search from './components/Search/Search'
import Messages from './components/Messages/Message'
import Profile from './components/Profile/Profile'
// import Login from './components/Login/Login'
import Notification from './components/Notification/Notification'
import { FacilitiesLayout } from "./components/Facility/FacilityLayout";
import Reels from "./components/Reels/Reels";
import PostState from "./createContext/Post/PostState";
import SearchModalState from "./createContext/is-Auth/IsAuthStates";

function App() {
  return (
    <SearchModalState>
      <PostState>

    <>
      <Router>
    
        <div className="dashboard">
          <div className="dashboardWrapper">
            <LeftSidebar />
            <Routes>
            <Route path="/" element={<Navigate to="/home" />} />
              <Route path="/home" element={<><MainContent /><RightSidebar/></>} />
              <Route path="/search" element={<><Search /><RightSidebar/></>} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/profile" element={<><Profile /><RightSidebar/></>} />
              <Route path="/notification" element={<><Notification /><RightSidebar/></>} />
              <Route path="/facilities" element={<><FacilitiesLayout /><RightSidebar/></>} />
              <Route path="/profile" element={<><Profile /><RightSidebar/></>} />
              <Route path="/reels" element={<><Reels /><RightSidebar/></>} />
            </Routes>
          </div>
        </div>
      </Router>
    </>
      </PostState>
    </SearchModalState>
  );
}

export default App;
