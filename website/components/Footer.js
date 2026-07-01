import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <Image src="/logo.png" alt="Fisiko" width={44} height={44} className="rounded-xl" />
              <span className="text-2xl font-extrabold">Fisiko</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              The all-in-one sports app for athletes. Book facilities, create matches, track scores, and connect with players worldwide.
            </p>
            <div className="flex gap-4">
              <a href="https://twitter.com/fisikoapp" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 hover:bg-primary flex items-center justify-center transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://instagram.com/fisikoapp" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 hover:bg-primary flex items-center justify-center transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://tiktok.com/@fisikoapp" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 hover:bg-primary flex items-center justify-center transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
              </a>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-semibold mb-5 text-white">Features</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/#features" className="text-gray-400 hover:text-primary transition">Book Facilities</Link></li>
              <li><Link href="/#features" className="text-gray-400 hover:text-primary transition">Create Matches</Link></li>
              <li><Link href="/#features" className="text-gray-400 hover:text-primary transition">Live Scores</Link></li>
              <li><Link href="/#features" className="text-gray-400 hover:text-primary transition">AI Assistant</Link></li>
              <li><Link href="/#features" className="text-gray-400 hover:text-primary transition">Find Players</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-5 text-white">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/support" className="text-gray-400 hover:text-primary transition">Support</Link></li>
              <li><a href="mailto:hello@fisiko.io" className="text-gray-400 hover:text-primary transition">Contact Us</a></li>
              <li><Link href="/support" className="text-gray-400 hover:text-primary transition">FAQ</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-5 text-white">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/privacy-policy" className="text-gray-400 hover:text-primary transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-primary transition">Terms of Service</Link></li>
              <li><Link href="/eula" className="text-gray-400 hover:text-primary transition">EULA</Link></li>
            </ul>
          </div>
        </div>

        {/* Download buttons */}
        <div className="border-t border-slate-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-gray-400 text-sm">Download Fisiko free on iOS and Android</p>
            <div className="flex gap-4">
              <a 
                href="https://apps.apple.com/us/app/fisiko-ai/id6759229981" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition"
              >
                <svg viewBox="0 0 384 512" className="w-5 h-5" fill="currentColor">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                </svg>
                <span className="text-sm font-medium">App Store</span>
              </a>
              <a 
                href="https://play.google.com/store/apps/details?id=io.fisiko.www.twa" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition"
              >
                <svg viewBox="0 0 512 512" className="w-5 h-5">
                  <path fill="#00D4FF" d="M325.3 234.3 104.6 13.6 391.6 178z"/>
                  <path fill="#FFCE00" d="m104.6 13.6 220.7 220.7-220.7 220.7c-9.4-3.6-15.6-12.7-15.6-23.3V36.9c0-10.6 6.2-19.7 15.6-23.3z"/>
                  <path fill="#FF3C5C" d="M325.3 234.3 391.6 178 104.6 13.6c-1.5-.6-3.1-1-4.7-1.3l225.4 222z"/>
                  <path fill="#00F076" d="M325.3 234.3 99.9 456.4c1.6-.3 3.2-.7 4.7-1.3L391.6 290.6z"/>
                </svg>
                <span className="text-sm font-medium">Google Play</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Fisiko. All rights reserved.</p>
          <p className="text-gray-500 text-sm">Made with ❤️ for athletes worldwide</p>
        </div>
      </div>
    </footer>
  )
}
