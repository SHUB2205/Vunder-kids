// import React from 'react';

// const socialLinks = [
//     { name: 'facebook', icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/b9db45416004d77e243af39f844be5db20221eaa059817d8aca20bbf0856a258?placeholderIfAbsent=true&apiKey=1126fdd409354df98f70d71ca7bf443b', iconClass: 'aspect-[0.55] w-[11px]' },
//     { name: 'instagram', icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/8f024ae2aac2d83e0f5a89425e0f46fda6ce1060da17981ccb813bc9684fa58a?placeholderIfAbsent=true&apiKey=1126fdd409354df98f70d71ca7bf443b', iconClass: 'w-5 aspect-square' },
//     { name: 'youtube', icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/b8bf7ff165a09e9417f828c565768146e5b5b4ad70ea4848db37c521e6eea6d1?placeholderIfAbsent=true&apiKey=1126fdd409354df98f70d71ca7bf443b', iconClass: 'w-7 aspect-[1.4]' }
// ];

// function FooterSocial() {
//     return (
//         <div className="flex flex-col ml-5 w-[38%] max-md:ml-0 max-md:w-full">
//             <div className="flex flex-col items-start w-full text-white max-md:mt-10">
//                 <div className="flex flex-col self-stretch pl-1.5 w-full">
//                     <h3 className="text-2xl font-bold tracking-tight uppercase">
//                         Follow us on
//                     </h3>
//                     <ul className="mt-8">
//                         {socialLinks.map((link, index) => (
//                             <li key={index} className={`flex gap-${index === 0 ? '4' : index === 1 ? '3' : '2'} mt-${index === 0 ? '0' : '5'} text-xl leading-none text-right whitespace-nowrap`}>
//                                 <img loading="lazy" src={link.icon} alt={`${link.name} icon`} className={`object-contain shrink-0 self-start ${link.iconClass}`} />
//                                 <span>{link.name}</span>
//                             </li>
//                         ))}
//                     </ul>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default FooterSocial;


import React from 'react';

const socialLinks = [
    {
        name: 'facebook',
        icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/b9db45416004d77e243af39f844be5db20221eaa059817d8aca20bbf0856a258?placeholderIfAbsent=true&apiKey=1126fdd409354df98f70d71ca7bf443b',
        iconClass: 'aspect-[0.55] w-[11px]'
    },
    {
        name: 'instagram',
        icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/8f024ae2aac2d83e0f5a89425e0f46fda6ce1060da17981ccb813bc9684fa58a?placeholderIfAbsent=true&apiKey=1126fdd409354df98f70d71ca7bf443b',
        iconClass: 'w-5 aspect-square'
    },
    {
        name: 'youtube',
        icon: 'https://cdn.builder.io/api/v1/image/assets/TEMP/b8bf7ff165a09e9417f828c565768146e5b5b4ad70ea4848db37c521e6eea6d1?placeholderIfAbsent=true&apiKey=1126fdd409354df98f70d71ca7bf443b',
        iconClass: 'w-7 aspect-[1.4]'
    }
];

function FooterSocial() {
    return (
        <div className="flex flex-col w-[38%] max-md:ml-0 max-md:w-full">

            {/* Social Media Links Container */}
            <div className="flex flex-col items-start w-full text-white max-md:mt-10">

                {/* Title */}
                <div className="flex flex-col self-stretch w-full">
                    <h3 className="text-[15px] font-bold tracking-tight uppercase text-left underline">
                        Follow us on
                    </h3>

                    {/* List of Social Media Links */}
                    <ul className="mt-2 text-left">
                        {socialLinks.map((link, index) => (
                            <li
                                key={index}
                                className="flex gap-3 mt-4 text-[15px] leading-none items-center whitespace-nowrap"
                            >
                                <img
                                    loading="lazy"
                                    src={link.icon}
                                    alt={`${link.name} icon`}
                                    className={`object-contain shrink-0 self-center ${link.iconClass}`}
                                />
                                <span>{link.name}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default FooterSocial;
