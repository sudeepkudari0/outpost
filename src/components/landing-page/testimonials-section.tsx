'use client';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Content Creator',
    avatar: '👩‍💼',
    quote:
      'PostPilot saved me 10 hours a week. The AI captions are spot-on and the scheduling is seamless.',
  },
  {
    name: 'Marcus Johnson',
    role: 'Social Media Manager',
    avatar: '👨‍💼',
    quote:
      'Finally, a tool that lets me use my own AI key. No vendor lock-in, just pure productivity.',
  },
  {
    name: 'Emma Rodriguez',
    role: 'Agency Owner',
    avatar: '👩‍🔬',
    quote:
      'Managing 15 client accounts is now effortless. PostPilot is a game-changer for agencies.',
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            <span className="text-blue-600">Loved by Creators</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            See what our users have to say about PostPilot.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl transition-all duration-300 hover:bg-white/15 hover:border-white/30 hover:shadow-lg hover:shadow-primary/20 p-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="text-3xl">{testimonial.avatar}</div>
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-foreground">
                    {testimonial.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
              <p className="text-sm sm:text-base text-foreground leading-relaxed italic">
                "{testimonial.quote}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
