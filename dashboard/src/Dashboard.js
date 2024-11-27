import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import LeftSidebar from "./components/LeftSlidebar/LeftSidebar";
import MainContent from "./components/Home/MainContent";
import RightSidebar from "./components/RightSidebar/RightSidebar";
import Search from "./components/Search/Search";
import Messages from "./components/Messages/Message";
import Profile from "./components/Profile/Profile";
import Notification from "./components/Notification/Notification";
import { FacilitiesLayout } from "./components/Facility/FacilityLayout";
import Reels from "./components/Reels/Reels";
import MatchesComponent from "./components/Matches/MatchesComponent";
import ChatState from "./createContext/Chat/ChatStates";
import FollowersList from "./components/Profile/Components/PeopleList";
const Dashboard = () => {
  const location = useLocation();

  // Routes where LeftSidebar is hidden
  const noSidebarRoutes = ["/register", "/login"];

  return (
    <>
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
            element={
              <>
                <Notification />
                <RightSidebar />
              </>
            }
          />
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
                <MatchesComponent/>
                <RightSidebar />
              </>
            }
            />
        </Routes>
      </div>
    </div>
    </ChatState>
            </>
  );
};

export default Dashboard;
