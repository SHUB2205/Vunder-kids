import React from 'react';

function SportsBuddies() {
  return (
    <section className="relative z-10 flex flex-col items-center justify-center mt-10 w-full max-w-[1843px] mx-auto text-neutral-700">
      <div className="flex gap-5 w-full max-md:flex-col">

        {/* Text Content Container */}
        <div className="flex flex-col justify-center w-2/5 max-md:w-full mr-4">
          <div className="mt-10 max-md:mt-10">
            <h2 className="text-3xl font-medium leading-none max-md:text-4xl max-md:text-center text-neutral-700">
              Amplify With Sport Buddies.
              {/* <br className="hidden md:block" />
              <span className="text-blue-600">Sports Profile.</span> */}
            </h2>
            <p className="mt-10 text-xl font-light leading-relaxed text-black max-md:text-center max-md:mt-6">
              Connect with fellow athletes and sports enthusiasts to boost your game. Build your network, share match highlights, and collaborate on team activities. Whether you're training or competing, having your sport buddies by your side will help elevate your performance and keep you motivated. </p>
          </div>
        </div>
        {/* Image Container */}
        <div className="flex flex-col w-3/5 max-md:w-full">
          <img loading="lazy" src="images/sportBuddies.svg" alt='sport buddies' />

        </div>


      </div>
    </section>
  );
}

export default SportsBuddies;