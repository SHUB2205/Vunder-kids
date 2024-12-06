import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import MainContent from "./components/Home/MainContent";
import LeftSidebar from "./components/LeftSlidebar/LeftSidebar";
import RightSidebar from "./components/RightSidebar/RightSidebar";
import Search from "./components/Search/Search";
import Messages from "./components/Messages/Message";
import Profile from "./components/Profile/Profile";
import Notification from "./components/Notification/Notification"; // Single Notification component
import { FacilitiesLayout } from "./components/Facility/FacilityLayout";
import Reels from "./components/Reels/Reels";
import MatchesComponent from "./components/Matches/MatchesComponent";
import ChatState from "./createContext/Chat/ChatStates";
import FollowersList from "./components/Profile/Components/PeopleList";
import { requestPermission } from "./notification/requestPermission";
import { setupOnMessage } from "./notification/onMessage";
import AllNotifications from "./components/Notification/AllNotifications";
import MatchNotifications from "./components/Notification/matchNotification/matchNotification";
import OpenAiBtn from "./components/OpenAi/OpenAiBtn";
const Dashboard = () => {
  const location = useLocation();
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Routes where LeftSidebar is hidden
  const noSidebarRoutes = ["/register", "/login"];

  const [permission, setPermission] = useState(false);
  const [token, setToken] = useState(undefined);

  const handleChatClick = () => {
    console.log("Clicked");
    setIsChatOpen(!isChatOpen); // Toggle chat window visibility
  };

  // Notification
  useEffect(() => {
    // Call requestPermission inside useEffect and update the state
    const fetchPermission = async () => {
      const result = await requestPermission();
      setPermission(result.permission);
      setToken(result.token);
    };
    fetchPermission();
    setupOnMessage();
    // eslint-disable-next-line
  }, []);


  return (
    <ChatState>
      <div className="dashboard">
        <div className="dashboardWrapper">
          {/* Conditionally render the LeftSidebar */}
          {!noSidebarRoutes.includes(location.pathname) && <LeftSidebar />}
          <Routes>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route
              path="/home"
              element={
                <>
                  <MainContent />
                  <RightSidebar />
                </>
              }
            />
            <Route
              path="/search"
              element={
                <>
                  <Search />
                  <RightSidebar />
                </>
              }
            />
            <Route path="/messages" element={<Messages />} />
            <Route
              path="/profile/:username?"
              element={
                <>
                  <Profile />
                  <RightSidebar />
                </>
              }
            />
            <Route
              path="/list/:type"
              element={
                <>
                  <FollowersList />
                  <RightSidebar />
                </>
              }
            />
            <Route
              path="/notification"
              element={<Navigate to="/notification/all" />}
            />
            <Route
              path="/notification"
              element={
                <>
                  <Notification />
                  <RightSidebar />
                </>
              }
            >
              <Route path="all" element={<AllNotifications />} />{" "}
              {/* All Notifications */}
              <Route path="matches" element={<MatchNotifications />} />{" "}
              {/* Match Notifications */}
            </Route>

            <Route
              path="/facilities"
              element={
                <>
                  <FacilitiesLayout />
                  <RightSidebar />
                </>
              }
            />
            <Route
              path="/reels"
              element={
                <>
                  <Reels />
                  <RightSidebar />
                </>
              }
            />
            <Route
              path="/matches"
              element={
                <>
                  <MatchesComponent />
                  <RightSidebar />
                </>
              }
            />
          </Routes>
          <OpenAiBtn onClick={handleChatClick} isChatOpen={isChatOpen} />
        </div>
      </div>
    </ChatState>
  );
};

export default Dashboard;
