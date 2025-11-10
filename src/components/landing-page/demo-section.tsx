'use client';

export function DemoSection() {
  return (
    <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="text-blue-600">See It In Action</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Watch how PostPilot generates engaging captions powered by AI.
          </p>
        </div>

        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-1 overflow-hidden">
          <div className="bg-gradient-to-b from-primary/20 via-secondary/10 to-background rounded-xl p-8 sm:p-12 min-h-96 flex flex-col items-center justify-center relative">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-10 right-10 w-32 h-32 bg-accent/20 rounded-full blur-2xl animate-pulse"></div>
              <div
                className="absolute bottom-10 left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse"
                style={{ animationDelay: '1s' }}
              ></div>
            </div>

            <div className="relative z-10 text-center">
              <div className="mb-6 inline-block">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center">
                    <span className="text-2xl">✨</span>
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-2">
                AI Caption Generation
              </h3>
              <p className="text-muted-foreground max-w-sm">
                Watch as PostPilot generates engaging, on-brand captions in
                seconds using your preferred AI provider.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
