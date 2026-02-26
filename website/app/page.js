import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                <span className="text-primary">Play, Connect and Thrive.</span>{' '}
                App your parents want on your phone!
              </h1>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                Welcome to Fisiko - Your sports super app that brings together everyone who enjoys sport. 
                Be it playing, coaching, watching or tracking. Post your favorite sports moments, arrange matches, 
                and share the excitement with your friends. Whether you're organizing a local game or celebrating 
                a big win, Fisiko connects you with the sports community like never before. Game on!
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <a
                  href="https://apps.apple.com/app/fisiko"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-primary text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-primary-dark transition shadow-lg hover:shadow-xl"
                >
                  Download on App Store
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <svg viewBox="0 0 400 400" className="w-full h-full">
                    <circle cx="300" cy="300" r="150" fill="rgba(255,255,255,0.1)" />
                    <circle cx="100" cy="100" r="80" fill="rgba(255,255,255,0.05)" />
                  </svg>
                </div>
                <div className="relative z-10 flex justify-center items-end gap-4">
                  {/* Soccer Player Illustration */}
                  <div className="text-center">
                    <svg viewBox="0 0 120 200" className="w-32 h-48">
                      <ellipse cx="60" cy="195" rx="25" ry="5" fill="rgba(0,0,0,0.2)" />
                      <circle cx="60" cy="30" r="20" fill="#FFD5B4" />
                      <rect x="45" y="50" width="30" height="50" rx="5" fill="#9333EA" />
                      <rect x="42" y="100" width="15" height="60" fill="#9333EA" />
                      <rect x="63" y="100" width="15" height="60" fill="#9333EA" />
                      <rect x="40" y="155" width="18" height="25" fill="#FCD34D" />
                      <rect x="62" y="155" width="18" height="25" fill="#FCD34D" />
                      <circle cx="90" cy="180" r="15" fill="#EF4444" />
                      <circle cx="90" cy="180" r="15" fill="none" stroke="#FCD34D" strokeWidth="2" />
                    </svg>
                  </div>
                  {/* Second Player */}
                  <div className="text-center">
                    <svg viewBox="0 0 100 180" className="w-24 h-40">
                      <ellipse cx="50" cy="175" rx="20" ry="4" fill="rgba(0,0,0,0.2)" />
                      <circle cx="50" cy="25" r="18" fill="#FFD5B4" />
                      <rect x="35" y="43" width="30" height="45" rx="5" fill="#3B82F6" />
                      <text x="50" y="70" textAnchor="middle" fill="white" fontSize="12">00</text>
                      <rect x="33" y="88" width="14" height="50" fill="#1E3A8A" />
                      <rect x="53" y="88" width="14" height="50" fill="#1E3A8A" />
                      <rect x="31" y="135" width="16" height="22" fill="#FCD34D" />
                      <rect x="53" y="135" width="16" height="22" fill="#FCD34D" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
            Everything You Need for Your Sports Journey
          </h2>

          {/* Feature 1 - Sports Profile */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="bg-white rounded-3xl shadow-xl p-8 order-1 md:order-1">
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-4 right-4 flex gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="mt-8 flex items-center gap-4">
                  <div className="bg-white/20 rounded-lg p-3 w-24 h-16"></div>
                  <div className="flex-1">
                    <div className="bg-white/30 rounded h-3 w-full mb-2"></div>
                    <div className="bg-white/20 rounded h-2 w-3/4"></div>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-4 gap-4">
                  <div className="bg-white/20 rounded-lg p-2 aspect-square"></div>
                  <div className="bg-white/20 rounded-lg p-2 aspect-square"></div>
                  <div className="bg-white/20 rounded-lg p-2 aspect-square"></div>
                  <div className="bg-white/20 rounded-lg p-2 aspect-square"></div>
                </div>
                <div className="mt-6 flex justify-center gap-6">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <span className="text-2xl">⏱️</span>
                  </div>
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <span className="text-2xl">❤️</span>
                  </div>
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <span className="text-2xl">🏋️</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-2 md:order-2">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Create Your Sports Profile
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Build your personalized sports profile by sharing your athletic achievements, favorite sports, 
                and past match experiences. Connect with other sports enthusiasts, showcase your skills, 
                and stay active in your favorite sports community.
              </p>
            </div>
          </div>

          {/* Feature 2 - Set a Match */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="order-2 md:order-1">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Set A Match
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Easily organize and schedule matches with your friends or fellow athletes. Choose your sport, 
                set the date and time, and invite participants to join. Keep track of upcoming games and enjoy 
                a seamless way to arrange friendly competitions and tournaments.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-900 to-blue-950 rounded-3xl p-8 relative overflow-hidden order-1 md:order-2">
              <div className="absolute inset-0">
                <div className="absolute top-8 left-1/4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
                <div className="absolute top-8 right-1/4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
              </div>
              <div className="relative z-10 flex justify-center items-center py-8">
                <div className="text-6xl">🏓</div>
              </div>
              <div className="relative z-10 h-2 bg-white/30 rounded mt-4"></div>
              <div className="relative z-10 flex justify-between mt-2">
                <div className="w-1 h-8 bg-blue-400"></div>
                <div className="w-1 h-8 bg-blue-400"></div>
              </div>
            </div>
          </div>

          {/* Feature 3 - Connect */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl p-8 relative overflow-hidden order-1 md:order-1">
              <div className="flex justify-center items-end gap-4 py-8">
                <div className="text-6xl">⚽</div>
                <div className="flex gap-2">
                  <div className="w-16 h-24 bg-green-500 rounded-t-full"></div>
                  <div className="w-16 h-24 bg-orange-500 rounded-t-full"></div>
                  <div className="w-16 h-24 bg-blue-500 rounded-t-full"></div>
                </div>
              </div>
            </div>
            <div className="order-2 md:order-2">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Connect with Athletes
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Connect with fellow athletes and sports enthusiasts to boost your game. Build your network, 
                share match highlights, and collaborate on team activities. Whether you're training or competing, 
                having your sport buddies by your side will help elevate your performance and keep you motivated.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Wave Divider */}
      <div className="wave-divider bg-gray-50">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="fill-slate-800">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,googl172.46-45.71,248.8-84.81V0Z"></path>
        </svg>
      </div>

      {/* CTA Section */}
      <section className="bg-slate-800 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Join the Sports Community?
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Download Fisiko today and start connecting with athletes near you.
          </p>
          <a
            href="https://apps.apple.com/app/fisiko"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center bg-primary text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-primary-dark transition shadow-lg"
          >
            Get Started Free
          </a>
        </div>
      </section>

      <Footer />
    </main>
  )
}
