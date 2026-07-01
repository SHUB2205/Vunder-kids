'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image src="/logo.png" alt="Fisiko" width={44} height={44} className="rounded-xl shadow-lg group-hover:shadow-primary/30 transition-shadow" />
            <span className={`text-2xl font-extrabold transition-colors ${scrolled ? 'text-gray-900' : 'text-white'}`}>Fisiko</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/#features" className={`font-medium transition-colors hover:text-primary ${scrolled ? 'text-gray-600' : 'text-gray-200 hover:text-white'}`}>
              Features
            </Link>
            <Link href="/#facilities" className={`font-medium transition-colors hover:text-primary ${scrolled ? 'text-gray-600' : 'text-gray-200 hover:text-white'}`}>
              Facilities
            </Link>
            <Link href="/support" className={`font-medium transition-colors hover:text-primary ${scrolled ? 'text-gray-600' : 'text-gray-200 hover:text-white'}`}>
              Support
            </Link>
            <a
              href="https://apps.apple.com/us/app/fisiko-ai/id6759229981"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-primary to-orange-600 text-white px-6 py-2.5 rounded-full font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
            >
              Download Free
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden p-2 rounded-lg transition-colors ${scrolled ? 'text-gray-900' : 'text-white'}`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 bg-white rounded-b-2xl shadow-xl">
            <div className="flex flex-col space-y-1 px-2">
              <Link 
                href="/#features" 
                className="text-gray-700 hover:text-primary hover:bg-primary/5 px-4 py-3 rounded-xl transition font-medium" 
                onClick={() => setIsOpen(false)}
              >
                Features
              </Link>
              <Link 
                href="/#facilities" 
                className="text-gray-700 hover:text-primary hover:bg-primary/5 px-4 py-3 rounded-xl transition font-medium" 
                onClick={() => setIsOpen(false)}
              >
                Facilities
              </Link>
              <Link 
                href="/support" 
                className="text-gray-700 hover:text-primary hover:bg-primary/5 px-4 py-3 rounded-xl transition font-medium" 
                onClick={() => setIsOpen(false)}
              >
                Support
              </Link>
              <a
                href="https://apps.apple.com/us/app/fisiko-ai/id6759229981"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-primary to-orange-600 text-white px-4 py-3 rounded-xl text-center font-semibold mt-2"
              >
                Download Free
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
