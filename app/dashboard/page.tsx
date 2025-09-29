import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Users, BarChart3, Calendar, Clock } from "lucide-react"
import NextLink from "next/link"

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your social media management hub</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+2 from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Next: Today 3:00 PM</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Accounts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Across 3 platforms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2k</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Create Content
            </CardTitle>
            <CardDescription>Generate and publish new social media posts</CardDescription>
          </CardHeader>
          <CardContent>
            <NextLink href="/dashboard/create-post">
              <Button className="w-full">Create New Post</Button>
            </NextLink>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Manage Posts
            </CardTitle>
            <CardDescription>View and edit your scheduled and published content</CardDescription>
          </CardHeader>
          <CardContent>
            <NextLink href="/dashboard/posts">
              <Button variant="outline" className="w-full bg-transparent">
                View All Posts
              </Button>
            </NextLink>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Connect Accounts
            </CardTitle>
            <CardDescription>Link your social media platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <NextLink href="/dashboard/connections">
              <Button variant="outline" className="w-full bg-transparent">
                Manage Connections
              </Button>
            </NextLink>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest posts and scheduled content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 border rounded-lg">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-medium">New post published to Instagram</p>
                <p className="text-sm text-muted-foreground">2 hours ago</p>
              </div>
              <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Published</div>
            </div>

            <div className="flex items-center gap-4 p-3 border rounded-lg">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Post scheduled for LinkedIn</p>
                <p className="text-sm text-muted-foreground">Tomorrow at 9:00 AM</p>
              </div>
              <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Scheduled</div>
            </div>

            <div className="flex items-center gap-4 p-3 border rounded-lg">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Connected new Twitter account</p>
                <p className="text-sm text-muted-foreground">Yesterday</p>
              </div>
              <div className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">Connected</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
