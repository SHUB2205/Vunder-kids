import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

export const metadata = {
  title: 'End User License Agreement - Fisiko',
  description: 'End User License Agreement (EULA) for the Fisiko mobile application.',
}

export default function EULAPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">End User License Agreement</h1>
          <p className="text-gray-500 mb-8">Last updated: February 2024</p>
          
          <div className="legal-content prose prose-gray max-w-none">
            <h2>1. Agreement to Terms</h2>
            <p>
              This End User License Agreement ("EULA") is a legal agreement between you ("User" or "you") and Fisiko ("Company," "we," "us," or "our") for the use of the Fisiko mobile application ("App").
            </p>
            <p>
              By installing, copying, or otherwise using the App, you agree to be bound by the terms of this EULA. If you do not agree to the terms of this EULA, do not install or use the App.
            </p>

            <h2>2. License Grant</h2>
            <p>
              Subject to your compliance with this EULA, we grant you a limited, non-exclusive, non-transferable, revocable license to download, install, and use the App on a mobile device that you own or control, solely for your personal, non-commercial purposes.
            </p>

            <h2>3. License Restrictions</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Copy, modify, or distribute the App or any portion thereof</li>
              <li>Reverse engineer, decompile, or disassemble the App</li>
              <li>Rent, lease, lend, sell, or sublicense the App</li>
              <li>Remove, alter, or obscure any proprietary notices on the App</li>
              <li>Use the App for any commercial purpose without our prior written consent</li>
              <li>Use the App in any way that violates applicable laws or regulations</li>
              <li>Use the App to transmit malware, viruses, or other harmful code</li>
              <li>Attempt to gain unauthorized access to the App's systems or networks</li>
            </ul>

            <h2>4. Intellectual Property</h2>
            <p>
              The App and all copies thereof are proprietary to Fisiko and title thereto remains in Fisiko. All rights in the App not specifically granted in this EULA are reserved to Fisiko. The App is protected by copyright and other intellectual property laws and treaties.
            </p>
            <p>
              Fisiko, the Fisiko logo, and other Fisiko trademarks, service marks, graphics, and logos used in connection with the App are trademarks or registered trademarks of Fisiko. Other trademarks, service marks, graphics, and logos used in connection with the App may be the trademarks of their respective owners.
            </p>

            <h2>5. User Content</h2>
            <p>
              The App allows you to create, upload, and share content ("User Content"). You retain ownership of your User Content, but you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, and display your User Content in connection with the App.
            </p>
            <p>
              You represent and warrant that you own or have the necessary rights to your User Content and that your User Content does not violate the rights of any third party.
            </p>

            <h2>6. Privacy</h2>
            <p>
              Your use of the App is also governed by our Privacy Policy, which is incorporated into this EULA by reference. Please review our Privacy Policy to understand our practices regarding your personal information.
            </p>

            <h2>7. Updates and Modifications</h2>
            <p>
              We may from time to time develop and provide App updates, which may include upgrades, bug fixes, patches, and other error corrections and/or new features (collectively, "Updates"). Updates may also modify or delete features and functionality in their entirety. You agree that we have no obligation to provide any Updates or to continue to provide or enable any particular features or functionality.
            </p>

            <h2>8. Third-Party Services</h2>
            <p>
              The App may display, include, or make available third-party content or provide links to third-party websites or services. You acknowledge and agree that we are not responsible for any third-party content or services, including their accuracy, completeness, timeliness, validity, legality, or quality.
            </p>

            <h2>9. Disclaimer of Warranties</h2>
            <p>
              THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND. TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, WE DISCLAIM ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
            </p>
            <p>
              WE DO NOT WARRANT THAT THE APP WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS, OR THAT DEFECTS WILL BE CORRECTED.
            </p>

            <h2>10. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL FISIKO BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR IN CONNECTION WITH:
            </p>
            <ul>
              <li>Your use or inability to use the App</li>
              <li>Any unauthorized access to or use of our servers and/or any personal information stored therein</li>
              <li>Any interruption or cessation of transmission to or from the App</li>
              <li>Any bugs, viruses, or other harmful code that may be transmitted through the App</li>
              <li>Any errors or omissions in any content</li>
            </ul>

            <h2>11. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless Fisiko and its officers, directors, employees, agents, and successors from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorneys' fees, arising out of or in any way connected with your access to or use of the App or your violation of this EULA.
            </p>

            <h2>12. Term and Termination</h2>
            <p>
              This EULA is effective until terminated. Your rights under this EULA will terminate automatically without notice if you fail to comply with any of its terms. Upon termination, you must cease all use of the App and delete all copies from your devices.
            </p>
            <p>
              We may also terminate or suspend your access to the App at any time, without prior notice or liability, for any reason whatsoever.
            </p>

            <h2>13. Governing Law</h2>
            <p>
              This EULA shall be governed by and construed in accordance with the laws of the jurisdiction in which Fisiko operates, without regard to its conflict of law provisions.
            </p>

            <h2>14. Severability</h2>
            <p>
              If any provision of this EULA is held to be invalid or unenforceable, such provision shall be struck and the remaining provisions shall be enforced to the fullest extent under law.
            </p>

            <h2>15. Entire Agreement</h2>
            <p>
              This EULA, together with the Privacy Policy and Terms and Conditions, constitutes the entire agreement between you and Fisiko regarding the App and supersedes all prior agreements and understandings.
            </p>

            <h2>16. Contact Information</h2>
            <p>
              If you have any questions about this EULA, please contact us at:
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
