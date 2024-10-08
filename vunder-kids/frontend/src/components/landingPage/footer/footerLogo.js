import React from 'react';

function FooterLogo() {
    return (
        <div className="flex flex-col w-[38%] max-md:ml-0 max-md:w-full mr-8">
            <div className="flex self-start text-5xl whitespace-nowrap text-white max-md:text-4xl">
                <img loading="lazy" src="images/footerFisiko.svg" alt='fisiko' />

            </div>
            <div className="mt-2 text-base text-white not-italic text-[12px]">
                Address, State, Country, Pin
            </div>
        </div>
    );
}

export default FooterLogo;