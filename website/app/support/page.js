import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

export const metadata = {
  title: 'Support - Fisiko',
  description: 'Get help and support for the Fisiko app. Contact us with any questions or issues.',
}

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Support</h1>
          <p className="text-xl text-gray-600 mb-12">
            We're here to help! Find answers to common questions or get in touch with our team.
          </p>
          
          {/* Contact Section */}
          <div className="bg-gray-50 rounded-2xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Us</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Email Support</h3>
                  <p className="text-gray-600">For general inquiries and support</p>
                  <a href="mailto:support@fisiko.io" className="text-primary hover:underline font-medium">
                    support@fisiko.io
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I create an account?</h3>
                <p className="text-gray-600">
                  Download the Fisiko app from the App Store, then tap "Sign Up" to create your account. You can register using your email address or sign in with Apple or Google.
                </p>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I create or join a match?</h3>
                <p className="text-gray-600">
                  Navigate to the Matches tab in the app. To create a match, tap the "+" button and fill in the details. To join an existing match, browse available matches and tap "Join" on any match you'd like to participate in.
                </p>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I delete my account?</h3>
                <p className="text-gray-600">
                  Go to your Profile, tap the Settings icon, scroll down to "Account Actions," and tap "Delete Account." Please note that this action is permanent and cannot be undone.
                </p>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I make my profile private?</h3>
                <p className="text-gray-600">
                  Go to your Profile, tap Settings, then toggle on "Private Account." When your account is private, only approved followers can see your posts and activity.
                </p>
              </div>

              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I report inappropriate content?</h3>
                <p className="text-gray-600">
                  Tap the three dots (...) on any post, profile, or message and select "Report." Choose the reason for your report and submit. Our team will review it promptly.
                </p>
              </div>

              <div className="pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Is Fisiko free to use?</h3>
                <p className="text-gray-600">
                  Yes! Fisiko is free to download and use. All core features including creating matches, connecting with athletes, and sharing content are available at no cost.
                </p>
              </div>
            </div>
          </div>

          {/* App Info */}
          <div className="bg-slate-800 text-white rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4">App Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-400 text-sm">Current Version</p>
                <p className="font-semibold">1.0.0</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Platform</p>
                <p className="font-semibold">iOS</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Minimum iOS Version</p>
                <p className="font-semibold">iOS 13.0+</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Developer</p>
                <p className="font-semibold">Fisiko</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
