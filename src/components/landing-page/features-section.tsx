'use client';

const features = [
  {
    emoji: '🔑',
    title: 'Your AI, Your Key',
    description:
      'Use OpenAI, Claude, Gemini - whatever you want. You control costs and quality.',
    whyBuilt:
      "Why I built this: Tired of paying for terrible AI outputs I couldn't control",
  },
  {
    emoji: '📱',
    title: 'Multi-Platform',
    description:
      'Instagram, X, LinkedIn, TikTok, Facebook, Threads. One dashboard.',
    whyBuilt:
      "Why I built this: Instagram Graph API is hell. I figured it out so you don't have to.",
  },
  {
    emoji: '⚡',
    title: 'Blazing Fast',
    description:
      'Built with Next.js 14. Sub-200ms response times. Runs on < $50/mo infrastructure.',
    whyBuilt:
      'Why I built this: Because waiting 5 seconds for a post to load is unacceptable',
  },
  {
    emoji: '👁️',
    title: 'Live Previews',
    description: 'See exactly how posts look before publishing. No surprises.',
    whyBuilt:
      'Why I built this: Once published "test post pls ignore" to 10K followers. Never again.',
  },
  {
    emoji: '📊',
    title: 'Actual Analytics',
    description:
      'Engagement rates, best posting times, content performance. Data that matters.',
    whyBuilt:
      'Why I built this: Other tools show vanity metrics. I wanted actionable insights.',
  },
  {
    emoji: '🚀',
    title: 'Bulk Upload',
    description:
      'CSV import. Schedule 50 posts in 2 minutes. Saved me hours weekly.',
    whyBuilt:
      'Why I built this: Manually scheduling 30 posts for a client took 2 hours. Insane.',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950 border-t-4 border-b-4 border-[#1a1a1a]">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-black mb-8">
          Why I Built This
        </h2>

        <div className="bg-[#f5f5f0] dark:bg-gray-900 p-6 border-l-[6px] border-[#4ecdc4] mb-8 text-lg">
          "I was managing social media for 3 freelance clients. Buffer wanted
          $99/month. Hootsuite wanted $129/month. Their AI sucked and used their
          own keys (so I was paying for bad GPT-3.5 outputs).
          <br />
          <br />I thought: <strong>What if I just... built my own?</strong>{' '}
          Bring your own AI key, pay for what you use, actually good UI. Took 3
          months of nights/weekends. Here we are."
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`bg-white dark:bg-gray-900 p-6 border-[3px] border-[#1a1a1a] ${
                index % 2 === 0 ? 'rotate-[-1deg]' : 'rotate-[1deg]'
              } hover:scale-105 transition-transform`}
            >
              <h3 className="text-2xl font-bold mb-3 text-[#ff6b35]">
                {feature.emoji} {feature.title}
              </h3>
              <p className="text-base mb-4">{feature.description}</p>
              <div className="bg-[#ffe66d]  dark:bg-yellow-500 p-3 text-sm italic font-mono">
                {feature.whyBuilt}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
