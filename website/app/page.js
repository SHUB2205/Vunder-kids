import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import StoreButtons from '../components/StoreButtons'
import Image from 'next/image'

const features = [
  {
    icon: '🏟️',
    title: 'Book Sports Facilities',
    desc: 'Find and book tennis courts, basketball courts, cricket grounds, and more. Browse venues in Tampa, Miami, Delhi, Budapest, and cities worldwide.',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    icon: '⚡',
    title: 'Live Sport Scores',
    desc: 'Track live scores and breaking news for Football, Soccer, Basketball, Cricket, Tennis, and more — all in one place.',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: '🏆',
    title: 'Create & Join Matches',
    desc: 'Organize 1v1 or team matches in seconds. Pick a sport, venue, time, invite players, and track scores with mutual verification.',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    icon: '🤖',
    title: 'AI Sports Assistant',
    desc: 'Get personalized training tips, match analysis, and sports advice from our AI-powered assistant built for athletes.',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    icon: '👥',
    title: 'Find Players Near You',
    desc: 'Discover athletes in your area on the map. Filter by sport, skill level, and availability to find your perfect match.',
    gradient: 'from-green-500 to-emerald-600',
  },
  {
    icon: '📊',
    title: 'Track Your Progress',
    desc: 'Build your sports profile with match history, win/loss records, ratings, and achievements. Level up your game!',
    gradient: 'from-amber-500 to-orange-500',
  },
]

const sports = [
  { name: 'Football', emoji: '🏈' },
  { name: 'Soccer', emoji: '⚽' },
  { name: 'Basketball', emoji: '🏀' },
  { name: 'Tennis', emoji: '🎾' },
  { name: 'Cricket', emoji: '🏏' },
  { name: 'Baseball', emoji: '⚾' },
  { name: 'Pickleball', emoji: '🏓' },
  { name: 'Golf', emoji: '⛳' },
  { name: 'Volleyball', emoji: '🏐' },
  { name: 'Hockey', emoji: '🏒' },
  { name: 'Rugby', emoji: '🏉' },
  { name: 'Boxing', emoji: '🥊' },
  { name: 'Badminton', emoji: '🏸' },
  { name: 'Swimming', emoji: '🏊' },
  { name: 'Table Tennis', emoji: '🏓' },
  { name: 'MMA', emoji: '🥋' },
]

const testimonials = [
  {
    name: 'Marcus Johnson',
    role: 'Basketball Player',
    avatar: '🏀',
    quote: 'Finally an app that lets me find pickup games near me. Booked a court in Miami and had a full squad within hours!',
    rating: 5,
  },
  {
    name: 'Priya Sharma',
    role: 'Tennis Enthusiast',
    avatar: '🎾',
    quote: 'The facility booking feature is a game-changer. Found an amazing tennis center in Tampa through Fisiko.',
    rating: 5,
  },
  {
    name: 'David Chen',
    role: 'Soccer Coach',
    avatar: '⚽',
    quote: 'I use Fisiko to organize matches for my team. The score tracking and player stats make it so easy to manage everything.',
    rating: 5,
  },
]

const facilities = [
  { name: 'Tampa Bay Tennis Center', sport: 'Tennis', location: 'Tampa, FL', image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=300&fit=crop' },
  { name: 'Miami Heat Basketball Courts', sport: 'Basketball', location: 'Miami, FL', image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop' },
  { name: 'Delhi Cricket Ground', sport: 'Cricket', location: 'Delhi, India', image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400&h=300&fit=crop' },
  { name: 'Budapest Sports Arena', sport: 'Multi-Sport', location: 'Budapest, Hungary', image: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=400&h=300&fit=crop' },
]

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-28 pb-20 md:pt-36 md:pb-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/30 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px]" />
        </div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in-up">
              <span className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-primary/30">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Now live on App Store & Play Store
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight">
                Your Sports.
                <br />
                <span className="bg-gradient-to-r from-primary via-orange-400 to-amber-400 bg-clip-text text-transparent">Your Community.</span>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-gray-300 leading-relaxed max-w-xl">
                Book facilities, create matches, track scores, and connect with athletes worldwide. 
                Fisiko is the all-in-one sports app for players who want more.
              </p>
              <div className="mt-10">
                <StoreButtons />
              </div>
              <div className="mt-12 flex items-center gap-6 md:gap-10">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">30+</div>
                  <div className="text-sm text-gray-400">Sports</div>
                </div>
                <div className="h-12 w-px bg-gray-700" />
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">500+</div>
                  <div className="text-sm text-gray-400">Facilities</div>
                </div>
                <div className="h-12 w-px bg-gray-700" />
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">Live</div>
                  <div className="text-sm text-gray-400">Scores</div>
                </div>
                <div className="h-12 w-px bg-gray-700 hidden sm:block" />
                <div className="text-center hidden sm:block">
                  <div className="text-3xl md:text-4xl font-bold text-white">AI</div>
                  <div className="text-sm text-gray-400">Assistant</div>
                </div>
              </div>
            </div>

            {/* Phone Mockups */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                {/* Floating elements */}
                <div className="absolute -top-8 -left-8 w-20 h-20 bg-gradient-to-br from-primary to-orange-600 rounded-2xl shadow-2xl flex items-center justify-center text-4xl animate-float z-10">🏆</div>
                <div className="absolute top-1/4 -right-10 w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-2xl flex items-center justify-center text-3xl animate-float-delayed z-10">🏀</div>
                <div className="absolute bottom-20 -left-12 w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-2xl flex items-center justify-center text-3xl animate-float z-10">⚽</div>
                <div className="absolute -bottom-4 right-10 w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-2xl flex items-center justify-center text-2xl animate-float-delayed z-10">🎾</div>

                {/* Main Phone */}
                <div className="relative w-[280px] md:w-[300px] h-[560px] md:h-[600px] bg-gradient-to-b from-gray-800 to-gray-900 rounded-[3rem] p-2 shadow-2xl shadow-primary/20 border border-gray-700">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-900 rounded-b-2xl z-20" />
                  <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                    {/* Status bar */}
                    <div className="h-11 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between px-6 pt-2 text-xs font-semibold text-gray-800">
                      <span>9:41</span>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-2 border border-gray-800 rounded-sm relative"><div className="absolute right-0 top-0 bottom-0 w-2/3 bg-gray-800 rounded-sm" /></div>
                      </div>
                    </div>
                    {/* App header */}
                    <div className="px-4 py-2 flex items-center justify-between bg-white border-b border-gray-100">
                      <span className="text-xl font-extrabold bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">Fisiko</span>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">🔔</div>
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">💬</div>
                      </div>
                    </div>
                    {/* Facility booking card */}
                    <div className="m-3 rounded-2xl overflow-hidden shadow-lg">
                      <div className="h-28 bg-gradient-to-br from-emerald-400 to-teal-500 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-5xl">🎾</span>
                        </div>
                        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-[10px] font-semibold text-emerald-700">Featured</div>
                      </div>
                      <div className="p-3 bg-white">
                        <div className="font-bold text-sm text-gray-900">Tampa Bay Tennis Center</div>
                        <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">📍 Tampa, FL • ⭐ 4.7</div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-primary font-bold text-sm">$45/hr</span>
                          <button className="bg-primary text-white text-[10px] font-semibold px-3 py-1.5 rounded-full">Book Now</button>
                        </div>
                      </div>
                    </div>
                    {/* Match card */}
                    <div className="mx-3 p-3 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl text-white">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-semibold bg-primary/20 text-primary px-2 py-0.5 rounded-full">🏀 Upcoming Match</span>
                        <span className="text-[10px] text-gray-400">Tomorrow, 6 PM</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-lg mb-1">👤</div>
                          <div className="text-[10px]">You</div>
                        </div>
                        <div className="text-lg font-bold text-gray-400">VS</div>
                        <div className="text-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center text-lg mb-1">👤</div>
                          <div className="text-[10px]">@mike_23</div>
                        </div>
                      </div>
                    </div>
                    {/* Bottom tab bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around px-2">
                      <div className="flex flex-col items-center">
                        <span className="text-primary text-lg">🏠</span>
                        <span className="text-[8px] text-primary font-medium">Home</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-lg">🔍</span>
                        <span className="text-[8px] text-gray-400">Discover</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 -mt-6 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-white text-2xl shadow-lg">+</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-lg">🏆</span>
                        <span className="text-[8px] text-gray-400">Matches</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-lg">👤</span>
                        <span className="text-[8px] text-gray-400">Profile</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sports Marquee */}
      <section className="py-10 bg-white border-b border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-xs uppercase tracking-widest text-gray-400 mb-6 font-medium">Supported Sports</p>
          <div className="flex flex-wrap justify-center gap-2">
            {sports.map((s) => (
              <span key={s.name} className="inline-flex items-center gap-2 bg-gray-50 hover:bg-primary/10 hover:text-primary border border-gray-100 hover:border-primary/30 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-default">
                <span className="text-lg">{s.emoji}</span>
                {s.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Book Facilities Section */}
      <section className="py-24 bg-gradient-to-b from-white to-orange-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                🏟️ Facility Booking
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
                Book sports venues <span className="text-primary">instantly</span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Browse hundreds of sports facilities worldwide. From tennis courts in Tampa to cricket grounds in Delhi — 
                find, compare, and book your perfect venue in seconds.
              </p>
              <ul className="space-y-4">
                {[
                  'Search by sport, location, or facility name',
                  'View real-time availability and pricing',
                  'Book instantly with secure payment',
                  'Get directions and facility details',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {facilities.map((f, i) => (
                <div key={i} className={`rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 ${i === 0 ? 'col-span-2' : ''}`}>
                  <div className={`relative ${i === 0 ? 'h-48' : 'h-36'}`}>
                    <img src={f.image} alt={f.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="font-bold text-sm">{f.name}</div>
                      <div className="text-xs opacity-90">{f.location} • {f.sport}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Everything you need to <span className="text-primary">dominate</span>
            </h2>
            <p className="mt-5 text-lg text-gray-400">
              From booking facilities to tracking your stats — Fisiko has you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="group bg-slate-800/50 backdrop-blur rounded-3xl p-8 border border-slate-700 hover:border-primary/50 hover:bg-slate-800 transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-3xl mb-5 group-hover:scale-110 transition-transform shadow-lg`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                <p className="text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Match Creation Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative">
                {/* Match creation mockup */}
                <div className="bg-gradient-to-br from-slate-100 to-white rounded-3xl p-6 shadow-2xl border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-white font-bold">🏆</div>
                    <div>
                      <div className="font-bold text-gray-900">Create a Match</div>
                      <div className="text-sm text-gray-500">Step 3 of 3 • Venue & Time</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">Sport</div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🏀</span>
                        <span className="font-semibold">Basketball</span>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">Venue</div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📍</span>
                        <span className="font-semibold">Miami Heat Basketball Courts</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <div className="text-xs text-gray-500 mb-1">Date</div>
                        <div className="font-semibold">Tomorrow</div>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <div className="text-xs text-gray-500 mb-1">Time</div>
                        <div className="font-semibold">6:00 PM</div>
                      </div>
                    </div>
                    <button className="w-full bg-gradient-to-r from-primary to-orange-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all">
                      Create Match 🎯
                    </button>
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                🏆 Match Creation
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
                Create matches in <span className="text-primary">seconds</span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Set up 1v1 or team matches with just a few taps. Invite opponents, pick a venue, 
                and let Fisiko handle the rest — including score tracking with mutual verification.
              </p>
              <ul className="space-y-4">
                {[
                  '1v1 or team match formats',
                  'Smart player search with typeahead',
                  'Automatic score verification',
                  'Match history and statistics',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gradient-to-b from-orange-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
              Loved by <span className="text-primary">athletes</span> worldwide
            </h2>
            <p className="mt-5 text-lg text-gray-600">
              Join thousands of sports enthusiasts already using Fisiko.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <span key={j} className="text-amber-400">★</span>
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-orange-100 flex items-center justify-center text-2xl">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{t.name}</div>
                    <div className="text-sm text-gray-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">Get started in <span className="text-primary">3 steps</span></h2>
            <p className="mt-5 text-lg text-gray-600">Download, sign up, and start playing.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: '📱', title: 'Download the app', desc: 'Get Fisiko free from the App Store or Google Play. Available on iOS and Android.' },
              { step: '02', icon: '👤', title: 'Create your profile', desc: 'Add your favorite sports, skill level, and location. Connect with athletes near you.' },
              { step: '03', icon: '🎯', title: 'Start playing', desc: 'Book facilities, create matches, track scores, and build your sports legacy!' },
            ].map((s) => (
              <div key={s.step} className="relative bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-3xl p-8 hover:shadow-xl transition group">
                <div className="text-7xl font-extrabold text-primary/10 absolute top-4 right-6 group-hover:text-primary/20 transition-colors">{s.step}</div>
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-3xl mb-5 shadow-lg">{s.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{s.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 text-9xl">⚽</div>
          <div className="absolute bottom-10 right-10 text-9xl">🏈</div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl">🏀</div>
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Ready to level up your game?
          </h2>
          <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Join thousands of athletes already using Fisiko to book facilities, create matches, and connect with players worldwide.
          </p>
          <StoreButtons variant="light" />
          <p className="mt-8 text-gray-500 text-sm">Free to download • No credit card required</p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
