import React from 'react';

const Header = () => {
    return (
        <header>
            {/* Container for logo and navigation */}
            <div className="max-w-7xl mx-auto px-4 flex justify-between items-center mt-2 ml-2">
                {/* Logo */}
                <img src="images/fisko.svg" alt='fisiko' />

                {/* Navigation Menu */}
                <nav className="hidden md:flex flex-grow justify-end items-center space-x-12">
                    <a href="#about-us" className="text-white hover:text-gray-900">About Us</a>
                    <a href="#features" className="text-white hover:text-gray-900">Features</a>
                    <a href="#contact-us" className="text-white hover:text-gray-900">Contact Us</a>
                    <a href="#sign-in" className="text-white hover:text-gray-900">Sign In</a>

                    {/* Sign Up Button */}
                    <button className="hidden md:block bg-white text-black font-bold rounded-full py-2 px-6 
                hover:bg-black hover:text-white transition space-x-12">
                        SIGN UP
                    </button>
                </nav>
            </div>
        </header>
    );
};

export default Header;
