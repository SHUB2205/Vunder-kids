// import React from 'react';

// function SportsProfile() {
//   return (
//     <section className="relative z-10 flex flex-col items-center justify-center mt-80 w-full max-w-[1843px] mx-auto text-neutral-700 ">
//       <div className="flex gap-5 w-full max-md:flex-col">
//         {/* Image Container */}
//         <div className="flex flex-col w-3/5 max-md:w-full">
//           <img
//             loading="lazy"
//             src="images/sportProfile.svg"
//             alt='sport'
//           />
//         </div>

//         {/* Text Content Container */}
//         <div className="flex flex-col justify-center w-2/5 max-md:w-full ml-4">
//           {/* Image above the text */}
//           <div className="flex justify-center mb-4 max-md:mb-6">
//             <img
//               src="images/plane.svg" // Replace with your image source path
//               alt="Sports Profile Icon"
//               className="w-20 h-20 object-contain max-md:w-24 max-md:h-24" // Adjust width and height as needed
//             />
//           </div>
//           <div className="mt-10 max-md:mt-10">
//             <h2 className="text-3xl font-medium leading-none max-md:text-4xl max-md:text-center text-neutral-700">
//               Create Your Sports Profile
//               {/* <br className="hidden md:block" />
//               <span className="text-blue-600">Sports Profile.</span> */}
//             </h2>
//             <p className="mt-10 text-xl font-light leading-relaxed text-black max-md:text-center max-md:mt-6">
//               Build your personalized sports profile by sharing your athletic achievements, favorite sports, and past match experiences. Connect with other sports enthusiasts, showcase your skills, and stay active in your favorite sports community.
//             </p>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

// export default SportsProfile;





import React from 'react';

function SportsProfile() {
  return (
    <section className="relative z-10 flex flex-col items-center justify-center mt-80 w-full max-w-[1843px] mx-auto text-neutral-700">
      <div className="flex gap-5 w-full max-md:flex-col">
        {/* Image Container */}
        <div className="flex flex-col w-3/5 max-md:w-full">
          <img loading="lazy" src="images/sportProfile.svg" alt="sport" />
        </div>

        {/* Text Content Container */}
        <div className="flex flex-col justify-center w-2/5 max-md:w-full ml-4 relative">
          <div className="mt-10 max-md:mt-10">
            <h2 className="text-3xl font-medium leading-none max-md:text-4xl max-md:text-center text-neutral-700">
              Create Your Sports Profile
            </h2>
            <p className="mt-10 text-xl font-light leading-relaxed text-black max-md:text-center max-md:mt-6">
              Build your personalized sports profile by sharing your athletic achievements, favorite sports, and past match experiences. Connect with other sports enthusiasts, showcase your skills, and stay active in your favorite sports community.
            </p>
          </div>

          {/* Image aligned to the right */}
          <div className="absolute top-12 left-64">
            <img
              src="images/plane.svg" // Replace with your image source path
              alt="Sports Profile Icon"
              className="w-24 h-24 object-contain" // Adjust width and height as needed
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default SportsProfile;
