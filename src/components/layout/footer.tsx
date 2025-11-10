'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 items-center justify-center gap-8 mb-8">
          <div>
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <div className="flex items-center font-bold text-3xl">
                  <span className="text-[#2F527E]">Out</span>
                  <span className="text-[#4DCDDB]">Post - AI</span>
                </div>
              </Link>
            </div>
            <p className="text-muted-foreground text-sm">
              Social media scheduling and content creation.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center">
            <h4 className="font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Features
                </a>
              </li>
              <li>
                <Link
                  href="/#pricing"
                  className="hover:text-foreground transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Docs
                </a>
              </li>
            </ul>
          </div>

          {/* <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div> */}

          <div className="flex flex-col items-center justify-center">
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground text-center">
              <li>
                <Link
                  href="/privacy-policy"
                  className="hover:text-foreground transition-colors"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-use"
                  className="hover:text-foreground transition-colors"
                >
                  Terms
                </Link>
              </li>
              <li>
                <Link
                  href="/data-deletion-policy"
                  className="hover:text-foreground transition-colors text-center"
                >
                  Data Deletion Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
