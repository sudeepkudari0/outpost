import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
      </header>

      {/* Main Content */}
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-8 sm:px-8">
              <div className="prose prose-lg max-w-none">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Terms of Use
                </h1>
                <p className="text-sm text-gray-600 mb-8">
                  Effective Date: October 9, 2025
                </p>

                <div className="mb-8">
                  <p className="text-gray-700 leading-relaxed">
                    Welcome to social.thinkroman.com, a service operated by
                    ThinkRoman Ventures LLC ("we," "us," "our").
                  </p>
                  <p className="text-gray-700 leading-relaxed mt-4">
                    By accessing or using this website, you agree to be bound by
                    these Terms of Use ("Terms"). If you do not agree, you may
                    not use the site.
                  </p>
                </div>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    1. Overview
                  </h2>
                  <p className="text-gray-700 mb-4">
                    These Terms govern your access to and use of the
                    social.thinkroman.com platform, including all content,
                    features, and services (collectively, the "Service").
                  </p>
                  <p className="text-gray-700">
                    You agree to use the Service only for lawful purposes and in
                    accordance with these Terms.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    2. Eligibility
                  </h2>
                  <p className="text-gray-700 mb-4">
                    By using our Service, you represent that:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>
                      You are at least 18 years old (or the age of majority in
                      your jurisdiction).
                    </li>
                    <li>
                      You have the legal capacity to enter into a binding
                      agreement.
                    </li>
                    <li>
                      You will comply with all applicable local, state,
                      national, and international laws and regulations.
                    </li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    3. Account Registration
                  </h2>
                  <p className="text-gray-700 mb-4">
                    Some areas of the Service require an account. When you
                    create one:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>You must provide accurate and complete information.</li>
                    <li>
                      You are responsible for maintaining the confidentiality of
                      your credentials.
                    </li>
                    <li>
                      You are responsible for all activities that occur under
                      your account.
                    </li>
                    <li>
                      If you suspect unauthorized access, contact{' '}
                      <a
                        href="mailto:admin@thinkroman.com"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        admin@thinkroman.com
                      </a>{' '}
                      immediately.
                    </li>
                  </ul>
                  <p className="text-gray-700 mt-4">
                    We reserve the right to suspend or terminate accounts that
                    violate these Terms or our policies.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    4. Acceptable Use
                  </h2>
                  <p className="text-gray-700 mb-4">You agree not to:</p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>
                      Use the Service for any unlawful, fraudulent, or harmful
                      purpose.
                    </li>
                    <li>
                      Post or transmit content that is offensive, defamatory,
                      obscene, or violates others' rights.
                    </li>
                    <li>
                      Impersonate any person or entity or misrepresent your
                      affiliation.
                    </li>
                    <li>
                      Attempt to gain unauthorized access to our systems or
                      data.
                    </li>
                    <li>
                      Interfere with or disrupt the operation or security of the
                      Service.
                    </li>
                    <li>
                      Use bots, scrapers, or automated means to collect data
                      without our permission.
                    </li>
                  </ul>
                  <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-400">
                    <p className="text-sm text-red-800">
                      <strong>Warning:</strong> Violation of this section may
                      result in suspension or permanent termination of your
                      account.
                    </p>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    5. User Content
                  </h2>
                  <p className="text-gray-700 mb-4">
                    You may post or upload content ("User Content") to the
                    Service.
                  </p>
                  <p className="text-gray-700 mb-4">
                    By submitting User Content, you:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>
                      Grant us a non-exclusive, worldwide, royalty-free license
                      to host, display, and distribute that content for the
                      purpose of operating the Service.
                    </li>
                    <li>Retain all ownership rights to your content.</li>
                  </ul>
                  <p className="text-gray-700 mt-4">
                    You are solely responsible for the accuracy and legality of
                    your User Content.
                  </p>
                  <p className="text-gray-700">
                    We reserve the right (but have no obligation) to remove or
                    restrict content that violates these Terms or applicable
                    law.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    6. Intellectual Property
                  </h2>
                  <p className="text-gray-700 mb-4">
                    All content and materials on social.thinkroman.com —
                    including logos, trademarks, designs, text, graphics, and
                    code — are owned by or licensed to ThinkRoman Ventures LLC
                    and protected by intellectual property laws.
                  </p>
                  <p className="text-gray-700">
                    You may not copy, modify, distribute, sell, or exploit any
                    part of the Service without our written permission.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    7. Third-Party Services and Links
                  </h2>
                  <p className="text-gray-700 mb-4">
                    The Service may include links or integrations to third-party
                    platforms (e.g., Facebook, Google, analytics providers).
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>
                      We are not responsible for the content, privacy policies,
                      or practices of those third parties.
                    </li>
                    <li>
                      Use of any third-party service is subject to their own
                      terms and policies.
                    </li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    8. Disclaimers
                  </h2>
                  <p className="text-gray-700 mb-4">
                    The Service is provided on an "as is" and "as available"
                    basis.
                  </p>
                  <p className="text-gray-700 mb-4">
                    We make no warranties or representations of any kind,
                    express or implied, including but not limited to:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>
                      Accuracy, reliability, or completeness of information
                    </li>
                    <li>Availability or security of the Service</li>
                    <li>
                      Fitness for a particular purpose or non-infringement
                    </li>
                  </ul>
                  <p className="text-gray-700 mt-4">
                    You use the Service at your own risk.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    9. Limitation of Liability
                  </h2>
                  <p className="text-gray-700 mb-4">
                    To the fullest extent permitted by law, ThinkRoman Ventures
                    LLC, its affiliates, and partners will not be liable for any
                    indirect, incidental, consequential, or punitive damages
                    arising out of:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Your access to or use of the Service</li>
                    <li>Any errors, interruptions, or unauthorized access</li>
                    <li>Loss of data, revenue, or profits</li>
                  </ul>
                  <p className="text-gray-700 mt-4">
                    Our total liability shall not exceed the greater of $100 or
                    the amount you paid us in the past 12 months.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    10. Indemnification
                  </h2>
                  <p className="text-gray-700 mb-4">
                    You agree to indemnify and hold harmless ThinkRoman Ventures
                    LLC, its affiliates, and personnel from any claims, damages,
                    or expenses arising from:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Your use of the Service</li>
                    <li>Your violation of these Terms</li>
                    <li>
                      Your infringement of any rights of another person or
                      entity
                    </li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    11. Termination
                  </h2>
                  <p className="text-gray-700 mb-4">
                    We may suspend or terminate your account and access to the
                    Service at any time, with or without notice, if we believe
                    you have violated these Terms or applicable laws.
                  </p>
                  <p className="text-gray-700">
                    Upon termination, your right to use the Service will
                    immediately cease. Sections 6–10 of these Terms will survive
                    termination.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    12. Privacy
                  </h2>
                  <p className="text-gray-700">
                    Your use of the Service is also governed by our{' '}
                    <Link
                      href="/privacy-policy"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Privacy Policy
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/data-deletion-policy"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Data Deletion Policy
                    </Link>
                    , which describe how we collect, use, and protect your
                    information.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    13. Governing Law and Dispute Resolution
                  </h2>
                  <p className="text-gray-700 mb-4">
                    These Terms are governed by the laws of the State of Texas,
                    United States, without regard to conflict of law principles.
                  </p>
                  <p className="text-gray-700">
                    Any dispute or claim arising out of or relating to the
                    Service shall be resolved exclusively in the state or
                    federal courts located in Dallas County, Texas, and you
                    consent to that jurisdiction.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    14. Changes to These Terms
                  </h2>
                  <p className="text-gray-700 mb-4">
                    We may update these Terms periodically to reflect changes in
                    our practices or the Service.
                  </p>
                  <p className="text-gray-700">
                    Updated versions will be posted here with a revised
                    effective date. Continued use of the Service after any
                    changes constitutes your acceptance of the new Terms.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    15. Contact Us
                  </h2>
                  <p className="text-gray-700 mb-4">
                    For questions or concerns about these Terms, contact:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>
                      Email:{' '}
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
