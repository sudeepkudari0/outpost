import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src="/postit-logo.png"
                  alt="Social"
                  width={1000}
                  height={1000}
                  className="w-[140px] h-[60px]"
                />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-8 sm:px-8">
              <div className="prose prose-lg max-w-none">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Privacy Policy
                </h1>
                <p className="text-sm text-gray-600 mb-8">
                  Effective Date: October 9, 2025
                </p>

                <div className="mb-8">
                  <p className="text-gray-700 leading-relaxed">
                    Welcome to social.thinkroman.com ("we," "our," "us").
                  </p>
                  <p className="text-gray-700 leading-relaxed mt-4">
                    We value your trust and are committed to protecting your
                    personal information. This Privacy Policy explains what we
                    collect, why we collect it, how we use it, and your rights.
                  </p>
                </div>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    1. Information We Collect
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-medium text-gray-900 mb-3">
                        a. Information you provide directly
                      </h3>
                      <ul className="list-disc pl-6 text-gray-700 space-y-2">
                        <li>
                          Name, email address, and login credentials (when you
                          create an account or sign in)
                        </li>
                        <li>
                          Profile details such as photo, username, or bio (if
                          you choose to provide them)
                        </li>
                        <li>
                          Communication content (messages, posts, or form
                          submissions)
                        </li>
                        <li>
                          Payment or billing information (only if applicable for
                          premium services)
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-medium text-gray-900 mb-3">
                        b. Information we collect automatically
                      </h3>
                      <p className="text-gray-700 mb-3">
                        When you use our site, we may automatically collect:
                      </p>
                      <ul className="list-disc pl-6 text-gray-700 space-y-2">
                        <li>IP address and device information</li>
                        <li>
                          Browser type, operating system, and access timestamps
                        </li>
                        <li>
                          Pages visited, referring URLs, and actions taken on
                          the site
                        </li>
                        <li>
                          Cookies or similar technologies to remember your
                          preferences and improve functionality
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-medium text-gray-900 mb-3">
                        c. Information from third parties
                      </h3>
                      <p className="text-gray-700 mb-3">
                        If you sign in with Facebook, Google, or other
                        providers, we receive limited data such as:
                      </p>
                      <ul className="list-disc pl-6 text-gray-700 space-y-2">
                        <li>
                          App-scoped ID, name, and email (if permission is
                          granted)
                        </li>
                      </ul>
                      <p className="text-gray-700 mt-3">
                        We do not receive your password or other private
                        credentials.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    2. How We Use Your Information
                  </h2>
                  <p className="text-gray-700 mb-4">
                    We use your information to:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>
                      Operate and improve our services and user experience
                    </li>
                    <li>
                      Authenticate your account and maintain session security
                    </li>
                    <li>Respond to inquiries and support requests</li>
                    <li>Customize your experience and show relevant content</li>
                    <li>
                      Communicate updates, policy changes, or promotional
                      information (you can opt out anytime)
                    </li>
                    <li>
                      Comply with legal obligations and prevent misuse or fraud
                    </li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    3. Cookies and Tracking
                  </h2>
                  <p className="text-gray-700 mb-4">
                    We use cookies and similar tools to:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Keep you signed in between sessions</li>
                    <li>Measure site performance and traffic analytics</li>
                    <li>Remember preferences such as language or theme</li>
                  </ul>
                  <p className="text-gray-700 mt-4">
                    You can adjust cookie settings in your browser at any time.
                    Disabling cookies may affect some functionality.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    4. Sharing and Disclosure
                  </h2>
                  <p className="text-gray-700 mb-4">
                    We do not sell your personal data.
                  </p>
                  <p className="text-gray-700 mb-4">
                    We may share limited information only in these cases:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>
                      <strong>Service providers:</strong> Trusted vendors who
                      process data on our behalf (e.g., hosting, analytics,
                      payment).
                    </li>
                    <li>
                      <strong>Legal obligations:</strong> When required by law,
                      subpoena, or government request.
                    </li>
                    <li>
                      <strong>Business transfers:</strong> If we merge, acquire,
                      or reorganize, your data may be transferred with
                      appropriate safeguards.
                    </li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    5. Data Retention
                  </h2>
                  <p className="text-gray-700 mb-4">
                    We retain personal data only as long as necessary for
                    legitimate business or legal purposes.
                  </p>
                  <p className="text-gray-700">
                    When you delete your account or request deletion, we erase
                    associated data and anonymize residual records as described
                    in our{" "}
                    <Link
                      href="/data-deletion-policy"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Data Deletion Policy
                    </Link>
                    .
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    6. Security
                  </h2>
                  <p className="text-gray-700 mb-4">
                    We use administrative, technical, and physical safeguards to
                    protect your information, including:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Encryption in transit (HTTPS/TLS)</li>
                    <li>
                      Restricted database access and authentication controls
                    </li>
                    <li>Regular audits and monitoring</li>
                  </ul>
                  <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400">
                    <p className="text-sm text-yellow-800">
                      Despite these measures, no system is 100% secure; use
                      discretion when sharing personal details online.
                    </p>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    7. Your Rights and Choices
                  </h2>
                  <p className="text-gray-700 mb-4">
                    Depending on your region, you may:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Access, correct, or update your data</li>
                    <li>Request deletion of your data</li>
                    <li>Withdraw consent for processing (where applicable)</li>
                    <li>Opt out of marketing communications</li>
                  </ul>
                  <p className="text-gray-700 mt-4">
                    To exercise these rights, contact{" "}
                    <a
                      href="mailto:admin@thinkroman.com"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      admin@thinkroman.com
                    </a>{" "}
                    or use the in-app privacy controls.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    8. Third-Party Links
                  </h2>
                  <p className="text-gray-700">
                    Our portal may include links to other websites or
                    integrations (e.g., Facebook login). We are not responsible
                    for their privacy practices. Please review their privacy
                    policies separately.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    9. Children's Privacy
                  </h2>
                  <p className="text-gray-700 mb-4">
                    We do not knowingly collect data from anyone under 16 years
                    old.
                  </p>
                  <p className="text-gray-700">
                    If you believe a child has used our site in violation of
                    this policy, please notify{" "}
                    <a
                      href="mailto:admin@thinkroman.com"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      admin@thinkroman.com
                    </a>{" "}
                    and we will take appropriate action.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    10. International Users
                  </h2>
                  <p className="text-gray-700 mb-4">
                    Our systems are primarily operated from the United States.
                  </p>
                  <p className="text-gray-700">
                    By using our services, you consent to the transfer and
                    processing of your information in accordance with this
                    Privacy Policy and applicable U.S. laws.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    11. Updates to this Policy
                  </h2>
                  <p className="text-gray-700 mb-4">
                    We may update this Privacy Policy periodically to reflect
                    changes in our practices.
                  </p>
                  <p className="text-gray-700">
                    Revisions will be posted here with a new effective date.
                    Continued use of our site means you accept those changes.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    12. Contact Us
                  </h2>
                  <p className="text-gray-700 mb-4">
                    For questions or concerns about this Privacy Policy or our
                    data practices, contact:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>
                      Email:{" "}
                      <a
                        href="mailto:admin@thinkroman.com"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        admin@thinkroman.com
                      </a>
                    </li>
                    <li>Address: ThinkRoman Ventures LLC, Texas, USA</li>
                  </ul>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
