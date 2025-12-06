'use client';

const techStack = [
  'Next.js 14',
  'React',
  'PostgreSQL',
  'Prisma ORM',
  'NextAuth',
  'Vercel',
  'Tailwind CSS',
];

const timeline = [
  {
    week: 'Week 1-2',
    title: 'OAuth Hell',
    description:
      'Instagram Graph API, Twitter API v2, LinkedIn API. Each one has weird quirks.',
  },
  {
    week: 'Week 3-5',
    title: 'Core Scheduling Engine',
    description:
      'Built job queue system, timezone handling, retry logic. Rate limiting was brutal.',
  },
  {
    week: 'Week 6-8',
    title: 'AI Integration',
    description:
      'OpenAI, Claude, Gemini SDKs. Added streaming responses for better UX.',
  },
  {
    week: 'Week 9-10',
    title: 'Analytics & Polish',
    description: 'Built dashboard, charts, export features. Fixed 147 bugs.',
  },
  {
    week: 'Week 11-12',
    title: 'Beta Testing',
    description:
      '10 users → 200 users. Scaled infrastructure. Added requested features.',
  },
];

const challenges = [
  'Rate limiting across 6 different APIs',
  'Image optimization for platform-specific requirements',
  'Real-time post previews that actually match final output',
  "Timezone conversion that doesn't break everything",
  'OAuth token refresh without losing user sessions',
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-16 px-4 sm:px-6 lg:px-8 bg-[#f5f5f0] dark:bg-gray-950"
    >
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-black mb-8">How It's Built</h2>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-3 mb-8">
          {techStack.map((tech, index) => (
            <div
              key={index}
              className="bg-[#1a1a1a] text-white px-4 py-2 text-sm font-mono border-[2px] border-[#1a1a1a]"
            >
              {tech}
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="bg-white dark:bg-gray-900 p-8 border-[3px] border-[#1a1a1a] mb-8">
          <h3 className="text-2xl font-bold mb-6">Development Timeline</h3>

          <div className="space-y-6">
            {timeline.map((item, index) => (
              <div
                key={index}
                className="border-l-[3px] border-[#ff6b35] pl-6 relative"
              >
                <div className="absolute w-3 h-3 bg-[#ff6b35] rounded-full -left-[7.5px] top-2" />
                <div className="font-bold mb-1">
                  {item.week}: {item.title}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {item.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Challenges */}
        <div className="bg-[#ffe66d] dark:bg-yellow-500 p-6 border-[3px] border-[#1a1a1a]">
          <strong className="text-xl block mb-3">
            🔥 Technical Challenges Solved:
          </strong>
          <ul className="space-y-2 ml-6 list-disc">
            {challenges.map((challenge, index) => (
              <li key={index} className="text-base">
                {challenge}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
