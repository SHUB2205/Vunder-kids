import React from 'react';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import Features from './components/Features';
import Sports from './components/Sports';
import Mentors from './components/Mentors';
import Articles from './components/Articles';
import Footer from './components/Footer';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard  from './components/chatComponents/Dashboard'; 

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element = {
           <> 
            <HeroSection />
            <Features />
            <Sports />
            <Mentors />
            <Articles />
            <Footer />
          </>
          }
          />
          <Route path="/register" Component={Register} />
          <Route path="/login" Component={Login} />
          <Route path="/chat" Component={Dashboard} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;

