import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import StoreButtons from '../components/StoreButtons'

const features = [
  {
    icon: '⚡',
    title: 'Live Sport Scores',
    desc: 'Track live scores and breaking news for Football, Soccer, Basketball, Cricket, Tennis, Pickleball, Chess and more — all in one place.',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: '🏆',
    title: 'Set Up Matches',
    desc: 'Organize matches with friends in seconds. Pick a sport, location, time, invite players with smart typeahead, and let everyone know.',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    icon: '📸',
    title: 'Share Your Game',
    desc: 'Post photos, videos, and reels of your sports moments. Tag the sport so it lands on the right community feed.',
    gradient: 'from-pink-500 to-purple-600',
  },
  {
    icon: '👥',
    title: 'Connect with Athletes',
    desc: 'Follow players in your area, build your sports network, and discover people who play what you play.',
    gradient: 'from-green-500 to-emerald-600',
  },
  {
    icon: '💬',
    title: 'Chat & DM',
    desc: 'Message your followers, coordinate teams, and stay in touch with your sports buddies — all in-app.',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    icon: '🔔',
    title: 'Smart Notifications',
    desc: 'Get notified for match invites, follows, likes, comments, and the right nudges to keep you active.',
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
  { name: 'Chess', emoji: '♟️' },
  { name: 'Running', emoji: '🏃' },
  { name: 'Cycling', emoji: '🚴' },
  { name: 'Swimming', emoji: '🏊' },
]

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-28 pb-20 md:pt-36 md:pb-32 bg-gradient-to-br from-orange-50 via-white to-amber-50">
        {/* Decorative background blobs */}
        <div className="absolute top-20 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -right-24 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in-up">
              <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Now live on App Store & Play Store
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.05] tracking-tight">
                Play. <span className="text-primary">Connect.</span> Thrive.
              </h1>
              <p className="mt-6 text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl">
                Fisiko is your sports super-app. Track live scores, set up matches, share your game-day moments,
                and build your athletic community — all in one place.
              </p>
              <div className="mt-10">
                <StoreButtons />
              </div>
              <div className="mt-10 flex items-center gap-8 text-sm text-gray-500">
                <div>
                  <div className="text-2xl font-bold text-gray-900">30+</div>
                  Sports supported
                </div>
                <div className="h-10 w-px bg-gray-200" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">Live</div>
                  Scores & News
                </div>
                <div className="h-10 w-px bg-gray-200" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">Free</div>
                  To download
                </div>
              </div>
            </div>

            {/* Phone Mockup */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                {/* Floating sport icons */}
                <div className="absolute -top-6 -left-6 w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-3xl animate-float">🏈</div>
                <div className="absolute top-1/3 -right-8 w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-3xl animate-float-delayed">🏀</div>
                <div className="absolute bottom-10 -left-10 w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-3xl animate-float">⚽</div>

                {/* Phone Frame */}
                <div className="relative w-[300px] h-[600px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-2xl z-20" />
                  <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                    {/* Status bar */}
                    <div className="h-12 bg-white flex items-center justify-between px-6 pt-2 text-xs font-semibold">
                      <span>9:41</span>
                      <span>● ● ●</span>
                    </div>
                    {/* App header */}
                    <div className="px-5 pb-3 flex items-center justify-between border-b border-gray-100">
                      <span className="text-2xl font-extrabold text-primary">Fisiko</span>
                      <div className="flex gap-3 text-xl">🔔 💬</div>
                    </div>
                    {/* Live score card */}
                    <div className="m-4 p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl text-white shadow-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">🏈 NFL · LIVE</span>
                        <span className="text-xs">Q4 · 02:15</span>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="text-center">
                          <div className="text-xs opacity-90">PATRIOTS</div>
                          <div className="text-3xl font-bold">13</div>
                        </div>
                        <div className="text-sm opacity-75">VS</div>
                        <div className="text-center">
                          <div className="text-xs opacity-90">SEAHAWKS</div>
                          <div className="text-3xl font-bold">29</div>
                        </div>
                      </div>
                    </div>
                    {/* Post preview */}
                    <div className="mx-4 p-3 border border-gray-100 rounded-2xl">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-pink-500" />
                        <div>
                          <div className="text-xs font-semibold">@coach_jake</div>
                          <div className="text-[10px] text-gray-500">Tagged · ⚽ Soccer</div>
                        </div>
                      </div>
                      <div className="h-24 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-3xl">⚽</div>
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">❤️ 248  💬 31  ↗ 12</div>
                    </div>
                    {/* Bottom tab bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around text-xl">
                      <span className="text-primary">🏠</span>
                      <span>🔍</span>
                      <span>▶️</span>
                      <span>🏆</span>
                      <span>👤</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sports Marquee */}
      <section className="py-12 bg-gray-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-sm uppercase tracking-widest text-gray-400 mb-6">All your favorite sports</p>
          <div className="flex flex-wrap justify-center gap-3">
            {sports.map((s) => (
              <span key={s.name} className="inline-flex items-center gap-2 bg-white/5 hover:bg-primary/20 hover:text-primary border border-white/10 px-4 py-2 rounded-full text-sm font-medium transition">
                <span className="text-lg">{s.emoji}</span>
                {s.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-gradient-to-b from-white to-orange-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
              Everything you need to <span className="text-primary">stay in the game</span>
            </h2>
            <p className="mt-5 text-lg text-gray-600">
              From organizing pickup matches to following live scores — Fisiko has it all.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="group bg-white rounded-3xl p-8 border border-gray-100 hover:border-primary/30 hover:shadow-2xl transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-3xl mb-5 group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                <p className="text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">How Fisiko works</h2>
            <p className="mt-5 text-lg text-gray-600">Get started in under a minute.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create your profile', desc: 'Sign up, add your favorite sports and bio. Done in seconds.' },
              { step: '02', title: 'Find your community', desc: 'Follow athletes, join sport feeds, and discover players near you.' },
              { step: '03', title: 'Play & post', desc: 'Set up matches, share highlights, track scores — game on!' },
            ].map((s) => (
              <div key={s.step} className="relative bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-3xl p-8 hover:shadow-xl transition">
                <div className="text-6xl font-extrabold text-primary/15 absolute top-4 right-6">{s.step}</div>
                <div className="relative">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{s.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-primary via-orange-500 to-red-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-9xl">⚽</div>
          <div className="absolute bottom-10 right-10 text-9xl">🏈</div>
          <div className="absolute top-1/2 left-1/2 text-9xl">🏀</div>
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Ready to join the community?
          </h2>
          <p className="text-white/90 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Download Fisiko free and start connecting with athletes today.
          </p>
          <StoreButtons variant="light" />
        </div>
      </section>

      <Footer />
    </main>
  )
}
