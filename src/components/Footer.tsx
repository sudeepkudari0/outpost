import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Logo */}
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

          {/* Policy Links */}
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
            <Link
              href="/privacy-policy"
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-use"
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm"
            >
              Terms of Use
            </Link>
            <Link
              href="/data-deletion-policy"
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm"
            >
              Data Deletion Policy
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              © 2025 ThinkRoman Ventures LLC. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
