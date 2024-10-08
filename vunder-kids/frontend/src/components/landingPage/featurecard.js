import React from 'react';

function FeatureCard({ title, icon }) {
    return (
        <div className="flex flex-col w-[33%] max-md:ml-0 max-md:w-full">
            <div className="flex relative flex-col grow items-center px-20 pt-11 w-full text-2xl font-medium text-orange-400 whitespace-nowrap bg-gray-200 leading-[54px] max-md:px-5 max-md:mt-10 max-md:max-w-full">
                <div className="flex flex-col w-20">
                    {icon && <img loading="lazy" src={icon} alt={`${title} icon`} className="object-contain self-center aspect-square w-[38px]" />}
                    <div>{title}</div>
                </div>
            </div>
        </div>
    );
}

export default FeatureCard;