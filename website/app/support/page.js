import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import StoreButtons from '../../components/StoreButtons'

export const metadata = {
  title: 'Support - Fisiko',
  description: 'Get help and support for the Fisiko app. Contact us with any questions or issues.',
}

const faqs = [
  {
    question: 'How do I create an account?',
    answer: 'Download the Fisiko app from the App Store or Google Play, then tap "Sign Up" to create your account. You can register using your email address or sign in with Apple or Google.',
  },
  {
    question: 'How do I book a sports facility?',
    answer: 'Go to the Booking tab, search for facilities by sport, location, or name. Select a facility, choose your preferred date and time slot, and confirm your booking. Payment is processed securely in-app.',
  },
  {
    question: 'How do I create or join a match?',
    answer: 'Navigate to the Matches tab in the app. To create a match, tap the "+" button, select a sport, invite opponents, choose a venue, and set the date/time. To join an existing match, browse available matches and tap "Join".',
  },
  {
    question: 'How does score verification work?',
    answer: 'After a match, both players submit the final score. When both scores match, the result is verified and added to your match history. This ensures fair and accurate record-keeping.',
  },
  {
    question: 'How do I find players near me?',
    answer: 'Use the Discover tab to see athletes on the map. You can filter by sport, skill level, and distance. Tap on any player to view their profile and send a match invitation.',
  },
  {
    question: 'How do I add my own facility?',
    answer: 'Go to the Booking tab and tap "Add Facility". Fill in the details including name, address, sports available, pricing, and amenities. Your facility will be visible to all users once submitted.',
  },
  {
    question: 'How do I delete my account?',
    answer: 'Go to your Profile, tap the Settings icon, scroll down to "Account Actions," and tap "Delete Account." Please note that this action is permanent and cannot be undone.',
  },
  {
    question: 'Is Fisiko free to use?',
    answer: 'Yes! Fisiko is free to download and use. All core features including creating matches, connecting with athletes, and booking facilities are available at no cost. Facility booking fees go directly to the venue.',
  },
]

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <Navbar />
      
      {/* Hero */}
      <div className="pt-32 pb-16 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <span className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
            💬 We're here to help
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Support Center</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Find answers to common questions or get in touch with our team.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Contact Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-orange-600 rounded-2xl flex items-center justify-center text-2xl mb-4">
              📧
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Email Support</h3>
            <p className="text-gray-600 mb-4">For general inquiries and support requests</p>
            <a href="mailto:support@fisiko.io" className="text-primary hover:underline font-semibold">
              support@fisiko.io
            </a>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl mb-4">
              ⚡
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Quick Response</h3>
            <p className="text-gray-600 mb-4">We typically respond within 24 hours</p>
            <span className="text-gray-500 font-medium">Monday - Friday, 9am - 6pm EST</span>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm flex-shrink-0 mt-0.5">?</span>
                  {faq.question}
                </h3>
                <p className="text-gray-600 pl-9">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* App Info */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-3xl p-8 md:p-10 border border-slate-700">
          <h2 className="text-2xl font-bold mb-6">App Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div>
              <p className="text-gray-400 text-sm mb-1">Version</p>
              <p className="font-semibold text-lg">1.0.0</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Platforms</p>
              <p className="font-semibold text-lg">iOS & Android</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Requirements</p>
              <p className="font-semibold text-lg">iOS 13+ / Android 8+</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Developer</p>
              <p className="font-semibold text-lg">Fisiko</p>
            </div>
          </div>
          <div className="pt-6 border-t border-slate-700">
            <p className="text-gray-400 mb-4">Download the app</p>
            <StoreButtons />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
