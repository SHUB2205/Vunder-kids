import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

export const metadata = {
  title: 'Privacy Policy - Fisiko',
  description: 'Privacy Policy for the Fisiko app - how we collect, use, and protect your data.',
}

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-500 mb-8">Last updated: February 2024</p>
          
          <div className="legal-content prose prose-gray max-w-none">
            <h2>1. Introduction</h2>
            <p>
              Fisiko ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application ("App").
            </p>
            <p>
              Please read this Privacy Policy carefully. By using the App, you agree to the collection and use of information in accordance with this policy.
            </p>

            <h2>2. Information We Collect</h2>
            <h3>2.1 Personal Information</h3>
            <p>We may collect the following personal information:</p>
            <ul>
              <li><strong>Account Information:</strong> Name, email address, username, password, and profile picture</li>
              <li><strong>Profile Information:</strong> Age, gender, location, bio, sports interests, and skill levels</li>
              <li><strong>Contact Information:</strong> Phone number (optional)</li>
              <li><strong>Social Login Data:</strong> Information from Google or Apple Sign-In if you choose to use these services</li>
            </ul>

            <h3>2.2 User-Generated Content</h3>
            <p>We collect content you create, upload, or share through the App, including:</p>
            <ul>
              <li>Posts, photos, and videos</li>
              <li>Stories and reels</li>
              <li>Comments and messages</li>
              <li>Match information and scores</li>
            </ul>

            <h3>2.3 Automatically Collected Information</h3>
            <p>When you use the App, we may automatically collect:</p>
            <ul>
              <li>Device information (device type, operating system, unique device identifiers)</li>
              <li>Usage data (features used, time spent, interactions)</li>
              <li>Log data (IP address, access times, app crashes)</li>
              <li>Location data (with your permission)</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use the collected information to:</p>
            <ul>
              <li>Provide, maintain, and improve the App</li>
              <li>Create and manage your account</li>
              <li>Enable social features and connections between users</li>
              <li>Facilitate match organization and sports activities</li>
              <li>Send notifications about matches, messages, and app updates</li>
              <li>Personalize your experience and content recommendations</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Ensure safety and security of the App</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2>4. Information Sharing</h2>
            <h3>4.1 With Other Users</h3>
            <p>
              Your profile information, posts, and activities may be visible to other users based on your privacy settings. You can control the visibility of your profile through the App's privacy settings.
            </p>

            <h3>4.2 With Service Providers</h3>
            <p>
              We may share information with third-party service providers who perform services on our behalf, such as:
            </p>
            <ul>
              <li>Cloud hosting and storage (e.g., MongoDB, Cloudinary)</li>
              <li>Analytics services</li>
              <li>Push notification services</li>
            </ul>

            <h3>4.3 Legal Requirements</h3>
            <p>
              We may disclose your information if required by law or in response to valid legal requests.
            </p>

            <h2>5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.
            </p>

            <h2>6. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active or as needed to provide you services. You may request deletion of your account and associated data at any time through the App's settings.
            </p>

            <h2>7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Portability:</strong> Request transfer of your data</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing</li>
            </ul>
            <p>
              To exercise these rights, please use the settings within the App or contact us at support@fisiko.io.
            </p>

            <h2>8. Children's Privacy</h2>
            <p>
              The App is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
            </p>

            <h2>9. Third-Party Links</h2>
            <p>
              The App may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to read the privacy policies of any third-party services you access.
            </p>

            <h2>10. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. By using the App, you consent to such transfers.
            </p>

            <h2>11. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically.
            </p>

            <h2>12. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
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
