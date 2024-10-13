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
function App() {
  return (
    <>
      <Router>
        <div className="dashboard">
          <div className="dashboardWrapper">
            <Sidebar />
            <Routes>
              <Route path="/" element={<MainContent />} />
              <Route path="/search" element={<Search />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/notification" element={<Notification />} />
            </Routes>
            <RightSidebar />
          </div>
        </div>
      </Router>
    </>
  );
}

export default App;
