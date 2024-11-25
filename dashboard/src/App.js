import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PostState from "./createContext/Post/PostState";
import IsAuthStates from "./createContext/is-Auth/IsAuthStates";

import Register from "./components/Auth/Register/Register";
import Login from "./components/Auth/Login/Login";
import About from "./components/Auth/Register/About/About";
import Passion from "./components/Auth/Register/Passion/Passion";
import UploadPicture from "./components/Auth/Register/UploadPicture/UploadPicture";
import Dashboard from "./Dashboard";
import RegisterStates from "./createContext/Register/RegisterStates";
import ReelState from "./createContext/Reels/ReelState";
import SearchState from "./createContext/Search/SearchState";
import WaitingScreen from "./components/Auth/Register/WaitingScreen/WaitingScreen";
import ProtectedRoute from "./ProtectedRoute"; // Import ProtectedRoute

function App() {
  return (
    <RegisterStates>
      <IsAuthStates>
        <PostState>
          <ReelState>
            <SearchState>
             
                <Router>
                  <Routes>
                    {/* Public Routes (accessible without token) */}
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />

                    {/* Protected Routes (accessible only with token) */}
                    <Route
                      path="/register/about"
                      element={
                        <ProtectedRoute>
                          <About />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/register/passion"
                      element={
                        <ProtectedRoute>
                          <Passion />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/register/uploadPicture"
                      element={
                        <ProtectedRoute>
                          <UploadPicture />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/register/waiting"
                      element={
                        <ProtectedRoute>
                          <WaitingScreen />
                        </ProtectedRoute>
                      }
                    />

                    {/* Other Protected Routes */}
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    {/* Add other protected routes here */}
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          {/* Profile component */}
                        </ProtectedRoute>
                      }
                    />

                    {/* Default route, also protected */}
                    <Route
                      path="*"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </Router>
             
            </SearchState>
          </ReelState>
        </PostState>
      </IsAuthStates>
    </RegisterStates>
  );
}

export default App;
