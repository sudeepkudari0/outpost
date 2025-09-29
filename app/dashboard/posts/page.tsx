"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Calendar,
  List,
  Plus,
  Upload,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

// Mock data for posts
const mockPosts = [
  {
    id: "68a799f1",
    content:
      "Migraine pain can ruin your day — but you don't have to push through it anymore. ComforTide 425 offers fast, non-drowsy relief trusted by doctors and...",
    scheduled: "Aug 21, 2025 at 07:17 PM PDT",
    created: "8/21/2025",
    platforms: ["instagram"],
    status: "scheduled",
    image: "/woman-headache.png",
  },
  {
    id: "68a7932",
    content:
      "Hey mama-to-be! ⭐ Iron is a big deal during pregnancy. Our 280 Plus supplement has you covered with iron, DHA, folic acid, and more! Join the Mother...",
    scheduled: "Aug 21, 2025 at 03:09 PM PDT",
    created: "8/21/2025",
    platforms: ["instagram"],
    status: "published",
    image: "/pregnant-woman-celebration.png",
  },
  {
    id: "68a797d5",
    content:
      "Welcome to Mother 280! We're thrilled to support you on your pregnancy journey with essential supplements, resources, and community support. Share wit...",
    scheduled: "Aug 21, 2025 at 03:04 PM PDT",
    created: "8/21/2025",
    platforms: ["instagram"],
    status: "published",
    image: "/pregnant-woman-wellness.png",
  },
]

// Calendar helper functions and calendar view component
const getDaysInMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

const getFirstDayOfMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

const getPostsForDate = (posts: any[], date: Date) => {
  const dateStr = date.toDateString()
  return posts.filter((post) => {
    const postDate = new Date(post.scheduled)
    return postDate.toDateString() === dateStr
  })
}

const CalendarView = ({ posts }: { posts: any[] }) => {
  const [currentDate, setCurrentDate] = useState(new Date())

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{formatDate(currentDate)}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {days.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}

            {/* Empty cells for days before month starts */}
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} className="p-2 h-24"></div>
            ))}

            {/* Calendar Days */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1
              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
              const dayPosts = getPostsForDate(posts, date)
              const isToday = date.toDateString() === new Date().toDateString()

              return (
                <div
                  key={day}
                  className={`p-2 h-24 border rounded-lg ${isToday ? "bg-blue-50 border-blue-200" : "border-border"}`}
                >
                  <div className="text-sm font-medium mb-1">{day}</div>
                  <div className="space-y-1">
                    {dayPosts.slice(0, 2).map((post, idx) => (
                      <div
                        key={idx}
                        className={`text-xs p-1 rounded truncate ${
                          post.status === "published" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {post.content.substring(0, 20)}...
                      </div>
                    ))}
                    {dayPosts.length > 2 && (
                      <div className="text-xs text-muted-foreground">+{dayPosts.length - 2} more</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PostsPage() {
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list")
  const [filterPosts, setFilterPosts] = useState("all")
  const [filterPlatforms, setFilterPlatforms] = useState("all")
  const [filterProfiles, setFilterProfiles] = useState("all")
  const [filterDates, setFilterDates] = useState("all")
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [importPreview, setImportPreview] = useState<any[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const { toast } = useToast()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "text/csv") {
      setCsvFile(file)
      parseCSVPreview(file)
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file",
        variant: "destructive",
      })
    }
  }

  const parseCSVPreview = async (file: File) => {
    const text = await file.text()
    const lines = text.split("\n")
    const headers = lines[0].split(",").map((h) => h.trim())

    const preview = lines
      .slice(1, 6)
      .map((line) => {
        const values = line.split(",").map((v) => v.trim())
        const row: any = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ""
        })
        return row
      })
      .filter((row) => Object.values(row).some((val) => val))

    setImportPreview(preview)
  }

  const handleImportCSV = async () => {
    if (!csvFile) return

    setIsImporting(true)
    const formData = new FormData()
    formData.append("file", csvFile)

    try {
      const response = await fetch("/api/import-csv", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Import successful",
          description: `${result.imported} posts imported successfully`,
        })
        setShowImportDialog(false)
        setCsvFile(null)
        setImportPreview([])
        // Refresh posts list here
      } else {
        toast({
          title: "Import failed",
          description: result.error || "Failed to import posts",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Import failed",
        description: "An error occurred while importing posts",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  const downloadCSVTemplate = () => {
    const csvContent = `content,scheduled_time,platforms,timezone,media_url
"Your post content here","2025-08-21 15:30:00","instagram;facebook","America/New_York","https://example.com/image.jpg"
"Another post example","2025-08-22 10:00:00","linkedin","UTC",""
"Third post without media","2025-08-23 14:15:00","twitter;instagram","America/Los_Angeles",""`

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "posts_template.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Posts</h1>
          <p className="text-muted-foreground">manage your scheduled and published content</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                import CSV
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Import Posts from CSV</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">CSV Format Requirements</h4>
                  <div className="text-sm space-y-2">
                    <p>
                      <strong>Required columns:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>
                        <code>content</code> - Your post text content
                      </li>
                      <li>
                        <code>scheduled_time</code> - Format: YYYY-MM-DD HH:MM:SS (e.g., 2025-08-21 15:30:00)
                      </li>
                      <li>
                        <code>platforms</code> - Semicolon-separated list (e.g., instagram;facebook;twitter)
                      </li>
                    </ul>
                    <p>
                      <strong>Optional columns:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>
                        <code>timezone</code> - Timezone (e.g., America/New_York, UTC) - defaults to UTC
                      </li>
                      <li>
                        <code>media_url</code> - URL to image/video for the post
                      </li>
                    </ul>
                    <Button variant="outline" size="sm" onClick={downloadCSVTemplate} className="mt-2 bg-transparent">
                      Download Template CSV
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="csv-file">Select CSV File</Label>
                  <Input id="csv-file" type="file" accept=".csv" onChange={handleFileSelect} className="mt-1" />
                </div>

                {importPreview.length > 0 && (
                  <div>
                    <Label>Preview (first 5 rows)</Label>
                    <div className="mt-2 border rounded-lg overflow-hidden">
                      <div className="bg-muted p-2 text-sm font-medium">
                        {Object.keys(importPreview[0]).join(" | ")}
                      </div>
                      {importPreview.map((row, index) => (
                        <div key={index} className="p-2 text-sm border-t">
                          {Object.values(row).join(" | ")}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleImportCSV} disabled={!csvFile || isImporting}>
                    {isImporting ? "Importing..." : "Import Posts"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Link href="/dashboard/create-post">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              create post
            </Button>
          </Link>
        </div>
      </div>

      {/* View Toggle and Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={filterPosts} onValueChange={setFilterPosts}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All posts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All posts</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPlatforms} onValueChange={setFilterPlatforms}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All platforms</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterProfiles} onValueChange={setFilterProfiles}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All profiles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All profiles</SelectItem>
              <SelectItem value="profile1">ThinkRoman</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterDates} onValueChange={setFilterDates}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All dates" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This week</SelectItem>
              <SelectItem value="month">This month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
          <Button
            variant={viewMode === "calendar" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("calendar")}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendar
          </Button>
        </div>
      </div>

      {viewMode === "list" ? (
        /* Posts List */
        <div className="space-y-4">
          {mockPosts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* Post Image */}
                  <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={post.image || "/placeholder.svg"}
                      alt="Post preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Post Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm text-muted-foreground line-clamp-3">{post.content}</p>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge variant={post.status === "published" ? "default" : "secondary"}>
                          {post.status === "published" ? (
                            <>
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                              Published
                            </>
                          ) : (
                            <>
                              <div className="w-2 h-2 bg-blue-500 rounded-full mr-1" />
                              Scheduled
                            </>
                          )}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Post Meta */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>scheduled: {post.scheduled}</span>
                      <span>created: {post.created}</span>
                      <span>id: {post.id}...</span>
                      <Button variant="ghost" size="sm" className="h-auto p-0">
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Platforms */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-muted-foreground">platforms:</span>
                      {post.platforms.map((platform) => (
                        <Badge key={platform} variant="outline" className="text-xs">
                          {platform}
                          {post.status === "published" && <div className="w-2 h-2 bg-green-500 rounded-full ml-1" />}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Calendar View */
        <CalendarView posts={mockPosts} />
      )}
    </div>
  )
}
