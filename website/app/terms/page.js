import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

export const metadata = {
  title: 'Terms and Conditions - Fisiko',
  description: 'Terms and Conditions for using the Fisiko app and services.',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms and Conditions</h1>
          <p className="text-gray-500 mb-8">Last updated: February 2024</p>
          
          <div className="legal-content prose prose-gray max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By downloading, installing, or using the Fisiko mobile application ("App"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not agree to these Terms, please do not use the App.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              Fisiko is a social sports platform that allows users to:
            </p>
            <ul>
              <li>Create and manage sports profiles</li>
              <li>Connect with other athletes and sports enthusiasts</li>
              <li>Organize and join sports matches and events</li>
              <li>Share sports-related content including posts, stories, and videos</li>
              <li>Communicate with other users through messaging features</li>
              <li>Discover sports facilities and venues</li>
            </ul>

            <h2>3. User Accounts</h2>
            <h3>3.1 Registration</h3>
            <p>
              To use certain features of the App, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
            </p>
            <h3>3.2 Account Security</h3>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
            </p>
            <h3>3.3 Age Requirements</h3>
            <p>
              You must be at least 13 years old to use the App. If you are under 18, you represent that you have your parent or guardian's permission to use the App.
            </p>

            <h2>4. User Conduct</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the App for any illegal purpose or in violation of any laws</li>
              <li>Post content that is harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable</li>
              <li>Impersonate any person or entity</li>
              <li>Interfere with or disrupt the App or servers</li>
              <li>Attempt to gain unauthorized access to any part of the App</li>
              <li>Use the App to send spam or unsolicited messages</li>
              <li>Collect or harvest user data without consent</li>
              <li>Post content that infringes on intellectual property rights</li>
            </ul>

            <h2>5. User Content</h2>
            <h3>5.1 Ownership</h3>
            <p>
              You retain ownership of the content you post on the App. By posting content, you grant Fisiko a non-exclusive, worldwide, royalty-free license to use, display, reproduce, and distribute your content in connection with the App.
            </p>
            <h3>5.2 Content Responsibility</h3>
            <p>
              You are solely responsible for the content you post. We do not endorse any user content and are not responsible for any content posted by users.
            </p>
            <h3>5.3 Content Removal</h3>
            <p>
              We reserve the right to remove any content that violates these Terms or that we find objectionable, without prior notice.
            </p>

            <h2>6. Intellectual Property</h2>
            <p>
              The App and its original content, features, and functionality are owned by Fisiko and are protected by international copyright, trademark, and other intellectual property laws.
            </p>

            <h2>7. Third-Party Services</h2>
            <p>
              The App may contain links to third-party websites or services. We are not responsible for the content or practices of any third-party services.
            </p>

            <h2>8. Disclaimer of Warranties</h2>
            <p>
              THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE APP WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
            </p>

            <h2>9. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, FISIKO SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE APP.
            </p>

            <h2>10. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Fisiko and its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising out of your use of the App or violation of these Terms.
            </p>

            <h2>11. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the App at any time, without prior notice, for any reason, including violation of these Terms.
            </p>

            <h2>12. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of any material changes. Your continued use of the App after such modifications constitutes acceptance of the updated Terms.
            </p>

            <h2>13. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Fisiko operates, without regard to its conflict of law provisions.
            </p>

            <h2>14. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> support@fisiko.io
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
