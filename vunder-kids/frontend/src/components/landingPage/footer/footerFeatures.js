// import React from 'react';

// const features = [
//     'Sports Profile',
//     'Set Matches',
//     'Track Games',
//     'Social Media'
// ];

// function FooterFeatures() {
//     return (
//         <div className="flex flex-col ml-5 w-3/12 max-md:ml-0 max-md:w-full">
//             <div className="flex flex-col grow text-xl text-white max-md:mt-10">
//                 <h3 className="text-2xl font-bold tracking-tight uppercase max-md:mr-1">
//                     features
//                 </h3>
//                 <ul className="mt-8">
//                     {features.map((feature, index) => (
//                         <li key={index} className={`mt-${index === 0 ? '0' : '5'} leading-none text-right`}>
//                             {feature}
//                         </li>
//                     ))}
//                 </ul>
//             </div>
//         </div>
//     );
// }

// export default FooterFeatures;


import React from 'react';

const features = [
    'Sports Profile',
    'Set Matches',
    'Track Games',
    'Social Media'
];

function FooterFeatures() {
    return (
        <div className="flex flex-col w-[38%] max-md:ml-0 max-md:w-full mr-8">

            {/* Container for features list */}
            <div className="flex flex-col grow text-[15px] text-white max-md:mt-10">
                {/* Features Title */}
                <h3 className="text-[15px] font-bold tracking-tight uppercase max-md:mr-1 text-left underline">
                    Features
                </h3>

                {/* List of Features */}
                <ul className="mt-2 text-left"> {/* Changed to text-left for alignment */}
                    {features.map((feature, index) => (
                        <li
                            key={index}
                            className="mt-4 leading-none" // Changed margin-top for each list item
                        >
                            {feature}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default FooterFeatures;
