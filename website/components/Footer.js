import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-4">Fisiko</h3>
            <p className="text-gray-400 text-sm">
              Your sports community app. Connect, play, and thrive.
            </p>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-300">FEATURES</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Sports Profile</li>
              <li>Set Matches</li>
              <li>Track Games</li>
              <li>Connect with Athletes</li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-300">LEGAL</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition">
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link href="/eula" className="text-gray-400 hover:text-white transition">
                  EULA
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-gray-400 hover:text-white transition">
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} Fisiko. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
