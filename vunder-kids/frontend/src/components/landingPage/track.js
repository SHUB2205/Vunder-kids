import React from 'react';
import FeatureCard from './featurecard';

const features = [
    { title: 'TRACK', icon: 'images/track.svg' },
    { title: 'SHARE', icon: 'images/share.svg' },
    { title: 'EXPLORE', icon: 'images/explore.svg' }
];

function Track() {
    return (
        <div className="flex relative flex-col w-full max-md:py-24 max-md:max-w-full">
            {/* Wavy background image */}
            <img
                className="absolute h-auto w-full"
                loading="lazy"
                src="images/trackWave.svg"
                alt=" background"
            />
            {/* Feature Cards */}
            <div className="relative px-7 py-8 mb-0 w-full bg-zinc-50 z-10 max-md:px-5 max-md:mb-2.5 max-md:max-w-full">
                <div className="flex gap-5 justify-center max-md:flex-col">
                    {features.map((feature, index) => (
                        <FeatureCard
                            key={index}
                            title={feature.title}
                            icon={feature.icon}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Track;
