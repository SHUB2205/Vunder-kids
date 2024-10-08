import React from 'react';

function Hero() {
  return (
    // Outer div with cyan background taking full width and height
    <div className="w-full h-screen flex ">

      {/* Inner section with content */}
      <div className=" flex flex-wrap gap-5 justify-between self-end w-[40vw] max-w-[1720px] text-zinc-900 max-md:max-w-full p-8 ml-24 m-4">

        {/* Content inside the section */}
        <div className="flex flex-col items-start my-auto max-md:max-w-full">
          <h2 className="text-[16px] font-medium text-blue-600 leading-[52px]">
            At Fisiko we are
          </h2>
          <h1 className="mt-1.5 text-[42px] leading-[54px] max-md:max-w-full max-md:text-4xl max-md:leading-[50px]">
            Unleash Your Inner Champion. Play, Compete, Conquer!
          </h1>
          <p className="self-stretch text-[12px] mt-4 font-light leading-6 max-md:max-w-full text-zinc-900">
            Welcome to Fisiko – the ultimate sports social media platform where athletes and fans come together! Post your favorite sports moments, arrange matches, and share the excitement with your friends. Whether you're organizing a local game or celebrating a big win, Fisiko connects you with the sports community like never before. Game on!
          </p>
          <button className="px-8 py-4 mt-4 text-sm font-bold tracking-tight text-center text-white uppercase bg-green-600 rounded-[52px] max-md:px-5">
            Learn More
          </button>
        </div>

      </div>

      <div className='flex-1 relative m-4'>
        <img
          className="w-full h-full object-cover "
          loading="lazy"
          src="images/twoBoys.svg"
          alt="wavy background"
        />
      </div>

    </div>
  );
}

export default Hero;
