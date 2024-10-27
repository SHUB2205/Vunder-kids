import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Sidebar from "./components/LeftSlidebar/LeftSidebar";
import MainContent from "./components/Home/MainContent";
import RightSidebar from "./components/RightSidebar/RightSidebar";
import Search from './components/Search/Search'
import Messages from './components/Messages/Message'
import Profile from './components/Profile/Profile'
// import Login from './components/Login/Login'
import Notification from './components/Notification/Notification'
import { FacilitiesLayout } from "./components/Facility/FacilityLayout";

function App() {
  return (
    <>
      <Router>
        <div className="dashboard">
          <div className="dashboardWrapper">
            <Sidebar />
            <Routes>
              <Route path="/" element={<><MainContent /><RightSidebar/></>} />
              <Route path="/search" element={<><Search /><RightSidebar/></>} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/profile" element={<><Profile /><RightSidebar/></>} />
              <Route path="/notification" element={<><Notification /><RightSidebar/></>} />
              <Route path="/facilities" element={<><FacilitiesLayout /><RightSidebar/></>} />
              <Route path="/profile" element={<><Profile /><RightSidebar/></>} />
            </Routes>
          </div>
        </div>
      </Router>
    </>
  );
}

export default App;
