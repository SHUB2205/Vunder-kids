import React from 'react';
import Header from './components/landingPage/header';
import Hero from './components/landingPage/hero';
import Footer from './components/landingPage/footer/footer';
import Tagline from './components/landingPage/TagLine';
import Track from './components/landingPage/track';
import AllCards from './components/landingPage/cards/allCards';
import Carousel from './components/landingPage/carousel';
function App() {
  return (
    <div className="flex overflow-hidden flex-col">
      <div className="flex flex-col w-full max-md:px-5 max-md:max-w-full">
        <div
          className="bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/images/headerWave1.png)',
            // backgroundSize: '100%', // Set the background image size to 50% of the container
            // backgroundPosition: 'center', // Center the image within the div
          }}
        >
          <Header />
          <Hero />
          <Tagline />
          <Carousel />
        </div>
        <Track />
        <AllCards />
      </div>
      <Footer />
    </div>
  )
}

export default App;
