'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white py-8 px-4 sm:px-6 lg:px-8 border-t-4 border-[#ff6b35]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center mb-4">
              <div className="font-black text-2xl font-mono">OUTPOST</div>
            </Link>
            <p className="text-gray-400 text-sm font-mono">
              Social media scheduling and AI content generation.
              <br />
              Built by one dev. Used by 200+ creators.
            </p>
          </div>

          {/* Product */}
          <div className="flex flex-col items-center">
            <h4 className="font-bold mb-4 font-mono">PRODUCT</h4>
            <ul className="space-y-2 text-sm text-gray-400 font-mono text-center">
              <li>
                <a href="#" className="hover:text-[#4ecdc4] transition-colors">
                  Features
                </a>
              </li>
              <li>
                <Link
                  href="/#pricing"
                  className="hover:text-[#4ecdc4] transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-[#4ecdc4] transition-colors">
                  Docs
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="flex flex-col items-center">
            <h4 className="font-bold mb-4 font-mono">LEGAL</h4>
            <ul className="space-y-2 text-sm text-gray-400 font-mono text-center">
              <li>
                <Link
                  href="/privacy-policy"
                  className="hover:text-[#4ecdc4] transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-use"
                  className="hover:text-[#4ecdc4] transition-colors"
                >
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link
                  href="/data-deletion-policy"
                  className="hover:text-[#4ecdc4] transition-colors"
                >
                  Data Deletion
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-6 text-center">
          <div className="text-sm text-gray-400 font-mono">
            © {new Date().getFullYear()} OutPost. Built with ☕ in Chennai,
            India 🇮🇳
          </div>
        </div>
      </div>
    </footer>
  );
}
