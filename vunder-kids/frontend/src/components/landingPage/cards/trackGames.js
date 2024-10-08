import React from 'react';

function TrackGames() {
  return (
    <section className="relative z-10 flex flex-col items-center justify-center mt-10 w-full max-w-[1843px] mx-auto text-neutral-700">
      <div className="flex gap-5 w-full max-md:flex-col">
        {/* Left Section: Image Container */}

        <div className="relative flex flex-col w-3/5 max-md:w-full">
          {/* <img loading="lazy" src="images/trackGamesBG.svg" /> */}

          {/* Background Image */}
          <img
            className="w-full h-auto"
            loading="lazy"
            src="images/trackGamesBG.svg"
            alt="Background"
          />

          {/* Front Image */}
          <img
            className="absolute center w-[100%] h-[98%] max-w-full max-h-full"
            loading="lazy"
            src="images/trackGames.svg"
            alt="Front "
          />
        </div>

        {/* Right Section: Text Content */}
        <div className="flex flex-col justify-center w-2/5 max-md:w-full ml-4">
          <div className="mt-10 max-md:mt-10">
            <h2 className="text-3xl font-medium leading-tight max-md:text-4xl max-md:text-center text-neutral-700">
              Track Games: Wins & Goals.
            </h2>
            <p className="mt-10 text-xl font-light leading-relaxed text-black max-md:text-center max-md:mt-6">
              Monitor your performance by tracking your wins, goals, and other stats for each game. Stay updated on your achievements, compare past results, and measure your progress as you aim for new milestones. Keep a detailed record of your sports journey and showcase your success.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TrackGames;
