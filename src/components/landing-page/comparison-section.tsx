'use client';

const competitors = [
  {
    name: 'Hootsuite',
    price: '$99/mo',
    cons: [
      'Slow UI',
      'Limited AI',
      'Teams add-on costs extra',
      'Locked-in AI credits',
    ],
  },
  {
    name: 'Buffer',
    price: '$60/mo',
    cons: [
      'No advanced analytics',
      'Basic AI features',
      '10 profiles max',
      'Mobile app is meh',
    ],
  },
  {
    name: 'SocialBee',
    price: '$79/mo',
    cons: [
      'Confusing UX',
      'Limited platforms',
      'Slow customer support',
      'No bulk upload',
    ],
  },
];

export function ComparisonSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-black mb-4">
          The{' '}
          <span className="bg-[#ff6b35] text-white px-2 rotate-[-1deg] inline-block">
            Competition
          </span>{' '}
          Tax
        </h2>

        <div className="text-xl mb-12 max-w-3xl">
          Here's what the big guys charge. I'm not saying they're bad... but
          $99/month for basic scheduling? 🤨
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {competitors.map((competitor, index) => (
            <div
              key={index}
              className="bg-gray-100 dark:bg-gray-900 p-6 border-[3px] border-gray-400 dark:border-gray-700"
            >
              <div className="text-2xl font-bold mb-2">{competitor.name}</div>
              <div className="text-3xl font-black text-red-600 mb-4">
                {competitor.price}
              </div>
              <div className="space-y-2">
                {competitor.cons.map((con, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-red-500 font-bold">✗</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {con}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* OutPost Comparison */}
        <div className="bg-[#4ecdc4] p-8 border-[3px] border-[#1a1a1a] rotate-[-1deg] transform">
          <div className="rotate-[1deg]">
            <h3 className="text-3xl font-black mb-4">OutPost (This Thing)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="text-4xl font-black mb-2">$10/mo</div>
                <div className="text-lg">Pro plan. Actually affordable.</div>
              </div>
              <div>
                <div className="text-4xl font-black mb-2">Your AI</div>
                <div className="text-lg">
                  Use your own keys. Control quality.
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 border-[2px] border-[#1a1a1a] font-mono text-sm">
              <strong>Math:</strong> Hootsuite ($99) - OutPost ($10) ={' '}
              <span className="bg-[#ffe66d] dark:bg-yellow-500 px-2">
                $89 saved/month
              </span>
              <br />
              That's $1,068/year. Buy a decent laptop instead. 💻
            </div>
          </div>
        </div>

        {/* Honest Note */}
        <div className="mt-8 bg-[#ffe66d] dark:bg-yellow-500  p-4 border-l-4 border-[#ff6b35] font-mono text-sm">
          <strong>📝 Honest note:</strong> These tools aren't terrible. They
          have big teams, enterprise features, and millions in funding. If you
          need white-glove support and compliance certifications, go with them.
          But if you just want to schedule posts and use good AI without
          breaking the bank? This works.
        </div>
      </div>
    </section>
  );
}
