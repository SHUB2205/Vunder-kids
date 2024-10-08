// import React from 'react';

// const companyLinks = [
//     { name: 'Privacy Policy', className: '' },
//     { name: 'Terms and Conditions', className: 'self-stretch' },
//     { name: 'About Us', className: '' },
//     { name: 'Login / Sign Up', className: 'font-light text-orange-400' }
// ];

// function FooterCompany() {
//     return (
//         <div className="flex flex-col w-6/12 max-md:ml-0 max-md:w-full">
//             <div className="flex flex-col grow items-start text-xl text-white max-md:mt-10">
//                 <h3 className="text-2xl font-bold tracking-tight uppercase">
//                     company
//                 </h3>
//                 <ul className="mt-8 w-full">
//                     {companyLinks.map((link, index) => (
//                         <li key={index} className={`mt-${index === 0 ? '0' : '5'} leading-none text-right ${link.className}`}>
//                             {link.name}
//                         </li>
//                     ))}
//                 </ul>
//             </div>
//         </div>
//     );
// }

// export default FooterCompany;



import React from 'react';

const companyLinks = [
    { name: 'Privacy Policy', className: '' },
    { name: 'Terms and Conditions', className: 'self-stretch' },
    { name: 'About Us', className: '' },
    { name: 'Login / Sign Up', className: 'font-light text-orange-500' }
];

function FooterCompany() {
    return (
        <div className="flex flex-col w-[38%] max-md:ml-0 max-md:w-full">

            {/* Company Links Container */}
            <div className="flex flex-col grow items-start text-[15px] text-white max-md:mt-10">

                {/* Title */}
                <h3 className="text-[15px] font-bold tracking-tight uppercase text-left underline">
                    Company
                </h3>

                {/* List of Company Links */}
                <ul className=" mt-2 w-full text-left">
                    {companyLinks.map((link, index) => (
                        <li
                            key={index}
                            className={`mt-4 leading-none ${link.className}`}
                        >
                            {link.name}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default FooterCompany;
