// import React from 'react';
// import FooterLogo from './footerLogo';
// import FooterFeatures from './footerFeatures';
// import FooterSocial from './footerSocial';
// import FooterCompany from './footerCompany';

// function Footer() {
//     return (
//         <footer className="flex flex-col items-center px-16 pt-80 pb-44 w-full bg-indigo-950 max-md:px-5 max-md:py-24 max-md:max-w-full">
//             <div className="mb-0 w-full max-w-[1574px] max-md:mb-2.5 max-md:max-w-full">
//                 <div className="flex gap-5 max-md:flex-col">
//                     <div className="flex flex-col w-[65%] max-md:ml-0 max-md:w-full">
//                         <div className="grow max-md:mt-10 max-md:max-w-full">
//                             <div className="flex gap-5 max-md:flex-col">
//                                 <FooterLogo />
//                                 <FooterFeatures />
//                                 <FooterSocial />
//                             </div>
//                         </div>
//                     </div>
//                     <div className="flex flex-col ml-5 w-[35%] max-md:ml-0 max-md:w-full">
//                         <div className="grow max-md:mt-10 max-md:max-w-full">
//                             <div className="flex gap-5 max-md:flex-col">
//                                 <FooterCompany />
//                                 <div className="flex flex-col ml-5 w-6/12 max-md:ml-0 max-md:w-full ">
//                                     <div className="mt-20 text-[10px] leading-loose text-right text-white max-md:mt-10 ">
//                                         © 2024 Fisiko. All rights reserved.
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </footer>
//     );
// }

// export default Footer;



import React from 'react';
import FooterLogo from './footerLogo';
import FooterFeatures from './footerFeatures';
import FooterSocial from './footerSocial';
import FooterCompany from './footerCompany';

function Footer() {
    return (
        <footer className="relative flex flex-col items-center px-16 pb-20 w-full bg-slate-900 max-md:px-5 max-md:py-24 max-md:max-w-full">
            <div className="relative w-screen h-auto overflow-hidden">
                <img
                    src="images/footerWave1.png"
                    alt="Footer Background"
                    className="w-full h-auto object-cover" // Ensures the image covers the entire width and adapts height proportionally
                />
            </div>

            {/* Footer Content */}
            <div className="relative z-10 w-full max-w-[1574px] max-md:mb-2.5 max-md:max-w-full pt-8">
                <div className="flex gap-5 max-md:flex-col">
                    <div className="flex flex-col w-[65%] max-md:ml-0 max-md:w-full">
                        <div className="grow max-md:mt-10 max-md:max-w-full">
                            <div className="flex gap-5 max-md:flex-col">
                                <FooterLogo />
                                <FooterFeatures />
                                <FooterSocial />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col ml-5 w-[35%] max-md:ml-0 max-md:w-full">
                        <div className="grow max-md:mt-10 max-md:max-w-full">
                            <div className="flex gap-5 max-md:flex-col">
                                <FooterCompany />
                                <div className="flex flex-col ml-5 w-6/12 max-md:ml-0 max-md:w-full">
                                    <div className="mt-20 text-[10px] leading-loose text-right text-white max-md:mt-10">
                                        © 2024 Fisiko. All rights reserved.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
