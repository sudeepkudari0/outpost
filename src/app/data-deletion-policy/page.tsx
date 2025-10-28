import Image from 'next/image';
import Link from 'next/link';

export default function DataDeletionPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/postit-logo.png"
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
                  User Data Deletion Policy
                </h1>
                <p className="text-sm text-gray-600 mb-8">
                  Last updated: October 9, 2025
                </p>

                <div className="mb-8">
                  <p className="text-gray-700 leading-relaxed">
                    At social.thinkroman.com ("we," "us," or "our"), you can
                    request deletion of your personal data at any time. This
                    page explains what we delete, how to request deletion, how
                    long it takes, and how we confirm it.
                  </p>
                </div>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    What this covers
                  </h2>
                  <p className="text-gray-700 mb-4">
                    This policy applies to data we process when you use our
                    portal, including:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>
                      Account identifiers (e.g., name, email, username,
                      app-scoped IDs for social logins)
                    </li>
                    <li>Profile information you provided</li>
                    <li>Session and authentication tokens</li>
                    <li>
                      App activity data stored by us (e.g., settings, saved
                      items tied to your account)
                    </li>
                  </ul>
                  <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Certain minimal records may be
                      retained where required by law, to prevent fraud/abuse, or
                      to meet security and audit obligations (see "What we may
                      retain" below).
                    </p>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    How to request deletion
                  </h2>

                  <div className="space-y-6">
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-medium text-gray-900 mb-3">
                        Option A — In-product request (recommended)
                      </h3>
                      <ol className="list-decimal pl-6 text-gray-700 space-y-2">
                        <li>
                          Log in to your account on social.thinkroman.com.
                        </li>
                        <li>
                          Go to Account → Privacy → Delete my data (or Settings
                          → Delete account).
                        </li>
                        <li>Follow the prompts to confirm.</li>
                        <li>
                          If you cannot access your account, use Option C
                          (email).
                        </li>
                      </ol>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-medium text-gray-900 mb-3">
                        Option B — Facebook Login (if you used Facebook to sign
                        in)
                      </h3>
                      <p className="text-gray-700 mb-3">
                        You may request deletion directly from Facebook:
                      </p>
                      <ol className="list-decimal pl-6 text-gray-700 space-y-2">
                        <li>Open Facebook → Settings → Apps and Websites.</li>
                        <li>Find social.thinkroman.com and choose Remove.</li>
                        <li>
                          Facebook will send us a deletion callback. We'll
                          delete your Facebook-linked data and return a
                          confirmation code.
                        </li>
                        <li>
                          You may receive a link to a status page showing your
                          request has been processed.
                        </li>
                      </ol>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-medium text-gray-900 mb-3">
                        Option C — Email request
                      </h3>
                      <p className="text-gray-700 mb-3">
                        Email{' '}
                        <a
                          href="mailto:admin@thinkroman.com"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          admin@thinkroman.com
                        </a>{' '}
                        with subject "Data Deletion Request" and include:
                      </p>
                      <ul className="list-disc pl-6 text-gray-700 space-y-1">
                        <li>The email address on your account, and</li>
                        <li>
                          (If applicable) your Facebook app-scoped user ID or
                          screenshots that help us locate your account.
                        </li>
                      </ul>
                      <p className="text-gray-700 mt-3">
                        For your security, we may ask you to verify ownership of
                        the account before processing.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    What we delete
                  </h2>
                  <p className="text-gray-700 mb-4">
                    When we process a validated deletion request, we delete:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>
                      Account profile and identifiers stored by us (including
                      app-scoped social IDs)
                    </li>
                    <li>
                      Authentication artifacts (e.g., refresh tokens, sessions)
                    </li>
                    <li>
                      App data tied to your account (preferences, saved content,
                      and other user-generated data stored on our systems)
                    </li>
                  </ul>
                  <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400">
                    <p className="text-sm text-blue-800">
                      <strong>Backups:</strong> Deletions propagate to backups
                      on their normal rotation schedule. We do not use backups
                      to restore deleted user accounts or data except as
                      required for disaster recovery.
                    </p>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    What we may retain
                  </h2>
                  <p className="text-gray-700 mb-4">
                    We may retain limited data where necessary to:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>
                      Comply with applicable laws, tax, or regulatory
                      requirements
                    </li>
                    <li>
                      Detect, investigate, or prevent security incidents and
                      abuse
                    </li>
                    <li>
                      Enforce our Terms, resolve disputes, or maintain necessary
                      audit logs
                    </li>
                  </ul>
                  <p className="text-gray-700 mt-4">
                    Where retention is required, we minimize what we keep and
                    the duration we keep it.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Timing & confirmation
                  </h2>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>
                      Most requests are processed within 30 days of
                      verification.
                    </li>
                    <li>
                      If your request came via Facebook's deletion flow, you'll
                      receive a confirmation code and, where provided, a link to
                      a status page.
                    </li>
                    <li>
                      If you requested via email, we'll confirm by email when
                      deletion is complete.
                    </li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Third-party services
                  </h2>
                  <p className="text-gray-700">
                    If your account connected to third-party services (e.g.,
                    Facebook), we will delete what we store. You may also need
                    to request deletion directly from those services under their
                    policies.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Children's data
                  </h2>
                  <p className="text-gray-700">
                    Our services are not intended for children where prohibited
                    by law. If you believe a child has used our services in
                    violation of our policies, contact{' '}
                    <a
                      href="mailto:admin@thinkroman.com"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      admin@thinkroman.com
                    </a>{' '}
                    and we will take appropriate action, including deletion
                    where applicable.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Contact us
                  </h2>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>
                      Questions or requests about this policy:{' '}
                      <a
                        href="mailto:admin@thinkroman.com"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        admin@thinkroman.com
                      </a>
                    </li>
                    <li>
                      For general privacy information, see our Privacy Policy
                      and Terms of Use.
                    </li>
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
