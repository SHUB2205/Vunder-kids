import React, { useState, useEffect } from 'react';

const Carousel = () => {
    // State to keep track of the current slide
    const [currentIndex, setCurrentIndex] = useState(0);

    // Array of images for the carousel
    const images = [
        'images/carousel-1.svg',
        'images/carousel-2.svg',
        'images/carousel-3.svg',
        'images/carousel-4.svg',
        'images/carousel-5.svg',
    ];

    // Auto-slide every 3 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide(); // Automatically go to the next slide
        }, 3000); // Change 3000 to any value to adjust slide speed (3000ms = 3 seconds)

        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, [currentIndex]); // Depend on currentIndex to change the slide

    // Function to go to the previous slide
    const prevSlide = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    // Function to go to the next slide
    const nextSlide = () => {
        const isLastSlide = currentIndex === images.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    return (
        <div className='flex h-screen w-screen relative'>
            {/* Background wave image */}
            <div className='absolute w-[100%] mt-[150px]'>
                <img
                    className="relative w-full h-auto" // Ensure it fills the entire width of the div
                    loading="lazy"
                    src="images/heroWave.svg"
                    alt="wavy background"
                />
            </div>

            {/* Carousel Container */}
            <div className='relative w-[55%] mx-auto overflow-hidden rounded-lg shadow-lg bg-lime-50 z-10 mb-32'>
                <div className="p-4 pb-0">
                    {/* Carousel Container with fixed height */}
                    <div className="relative w-full mx-auto overflow-hidden rounded-lg">
                        {/* Slide Wrapper with Flexbox */}
                        <div
                            className="flex transition-transform duration-500 ease-in-out"
                            style={{
                                transform: `translateX(-${currentIndex * 100}%)`, // Slide effect
                            }}
                        >
                            {/* Individual Slide */}
                            {images.map((image, idx) => (
                                <div key={idx} className="flex-shrink-0 w-full h-96">
                                    <img
                                        src={image}
                                        alt={`Slide ${idx}`}
                                        className="w-full h-full object-contain" // Maintain aspect ratio
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Navigation Buttons */}
                        <button
                            className="absolute left-0 top-1/2 transform -translate-y-1/2 text-black px-4 py-2 rounded-l z-10"
                            onClick={prevSlide}
                        >
                            &#8592; {/* Left arrow symbol */}
                        </button>
                        <button
                            className="absolute right-0 top-1/2 transform -translate-y-1/2 text-black px-4 py-2 rounded-r z-10"
                            onClick={nextSlide}
                        >
                            &#8594; {/* Right arrow symbol */}
                        </button>
                    </div>

                    {/* Dots Indicators */}
                    <div className="flex justify-center">
                        {images.map((_, idx) => (
                            <button
                                key={idx}
                                className={`w-4 h-4 mx-2 rounded-full ${idx === currentIndex ? 'bg-zinc-600' : 'bg-neutral-300'
                                    }`}
                                onClick={() => setCurrentIndex(idx)}
                            ></button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Image positioned at the bottom left */}
            <div className='absolute bottom-4 left-[70px] m-4 z-10'>
                <img
                    className="w-[250px] h-[100%] object-cover" // Adjust width as needed
                    loading="lazy"
                    src="images/oneBoy.svg"
                    alt="wavy background"
                />
            </div>
        </div>
    );
};

export default Carousel;

