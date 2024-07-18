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
          <Route path="/register" component={Register} />
          <Route path="/login" component={Login} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

