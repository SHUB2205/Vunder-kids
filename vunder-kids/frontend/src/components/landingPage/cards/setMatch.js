import React from 'react';

function SetMatch() {
  return (
    <section className="relative z-10 flex flex-col items-center justify-center mt-10 w-full max-w-[1843px] mx-auto text-neutral-700">
      <div className="flex gap-5 w-full max-md:flex-col">

        {/* Text Content Container */}
        <div className="flex flex-col justify-center w-2/5 max-md:w-full mr-4">
          <div className="mt-10 max-md:mt-10">
            <h2 className="text-3xl font-medium leading-none max-md:text-4xl max-md:text-center text-neutral-700">
              Set A Match.
              {/* <br className="hidden md:block" />
              <span className="text-blue-600">Sports Profile.</span> */}
            </h2>
            <p className="mt-10 text-xl font-light leading-relaxed text-black max-md:text-center max-md:mt-6">
              Easily organize and schedule matches with your friends or fellow athletes. Choose your sport, set the date and time, and invite participants to join. Keep track of upcoming games and enjoy a seamless way to arrange friendly competitions and tournaments.
            </p>
          </div>
        </div>
        {/* Image Container */}
        <div className="flex flex-col w-3/5 max-md:w-full">
          <img loading="lazy" src="images/setMatch.svg" alt='set match' />

        </div>
      </div>
    </section>
  );
}

export default SetMatch;