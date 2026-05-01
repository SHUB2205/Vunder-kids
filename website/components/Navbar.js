'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 text-2xl font-extrabold text-gray-900">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-red-500 flex items-center justify-center text-white text-lg shadow-md">F</span>
            <span>Fisiko</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/#features" className="text-gray-600 hover:text-gray-900 transition">
              Features
            </Link>
            <Link href="/support" className="text-gray-600 hover:text-gray-900 transition">
              Support
            </Link>
            <a
              href="https://apps.apple.com/app/fisiko"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-white px-5 py-2 rounded-full hover:bg-primary-dark transition"
            >
              Download App
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
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
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link href="/#features" className="text-gray-600 hover:text-gray-900 transition" onClick={() => setIsOpen(false)}>
                Features
              </Link>
              <Link href="/support" className="text-gray-600 hover:text-gray-900 transition" onClick={() => setIsOpen(false)}>
                Support
              </Link>
              <a
                href="https://apps.apple.com/app/fisiko"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary text-white px-5 py-2 rounded-full text-center hover:bg-primary-dark transition"
              >
                Download App
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
