import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight">
                ThinkSocial – Think. Post. Grow.
              </h1>
              <p className="text-xl text-muted-foreground">
                Create, schedule, and publish content across all your social
                media platforms with AI-powered assistance.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Get Started</CardTitle>
                <CardDescription>
                  Connect your social media accounts and start creating engaging
                  content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard">
                  <Button size="lg" className="w-full">
                    Open Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">
                  Connect Accounts
                </h3>
                <p>
                  Link Instagram, LinkedIn, Facebook, TikTok, YouTube, Threads,
                  and X
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">
                  AI-Powered Content
                </h3>
                <p>Generate platform-specific copy with OpenAI integration</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">
                  Schedule & Publish
                </h3>
                <p>Post immediately or schedule for optimal engagement times</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
