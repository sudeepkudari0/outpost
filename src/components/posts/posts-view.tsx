'use client';

import dayjs from 'dayjs';
import type React from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { client } from '@/lib/orpc/client';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  FileText,
  Filter,
  Image as ImageIcon,
  List,
  Plus,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

export type UiPost = {
  id: string;
  content: string;
  scheduled?: string | null;
  created?: string | null;
  platforms: string[];
  status: string;
  image?: string | null;
};

// Extract display content from post content (handles both string and object formats)
const getDisplayContent = (content: string): string => {
  try {
    // Try to parse if it's a JSON string
    const parsed = JSON.parse(content);
    if (typeof parsed === 'object' && parsed !== null) {
      // If it's an object with platform keys, extract the first platform's content
      const platformContents = Object.values(parsed).filter(
        v => typeof v === 'string' && v.trim().length > 0
      );
      if (platformContents.length > 0) {
        // If multiple platforms, show the first one
        return platformContents[0] as string;
      }
      return JSON.stringify(parsed); // Fallback to JSON if no valid string content
    }
    return String(parsed);
  } catch {
    // If not JSON, return as-is (already a string)
    return content;
  }
};

const getDaysInMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const getFirstDayOfMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const getPostsForDate = (posts: any[], date: Date) => {
  const dateStr = date.toDateString();
  return posts.filter(post => {
    const postDate = new Date(post.scheduled || post.created || 0);
    return postDate.toDateString() === dateStr;
  });
};

const CalendarView = ({ posts }: { posts: any[] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground">
          {formatDate(currentDate)}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 gap-px bg-border">
          {days.map(day => (
            <div
              key={day}
              className="bg-muted p-3 text-center text-sm font-semibold text-muted-foreground"
            >
              {day}
            </div>
          ))}

          {Array.from({ length: firstDay }, (_, i) => (
            <div key={`empty-${i}`} className="bg-card p-2 min-h-[120px]"></div>
          ))}

          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const date = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              day
            );
            const dayPosts = getPostsForDate(posts, date);
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <div
                key={day}
                className={`bg-card p-2 min-h-[120px] ${
                  isToday ? 'bg-primary/10' : ''
                }`}
              >
                <div
                  className={`text-sm font-medium mb-2 ${
                    isToday ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {day}
                </div>
                <div className="space-y-1">
                  {dayPosts.slice(0, 2).map((post, idx) => (
                    <div
                      key={idx}
                      className={`text-xs p-1.5 rounded truncate ${
                        post.status === 'published'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {getDisplayContent(post.content).substring(0, 20)}...
                    </div>
                  ))}
                  {dayPosts.length > 2 && (
                    <div className="text-xs text-muted-foreground font-medium">
                      +{dayPosts.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const PlatformBadge = ({
  platform,
  published,
}: {
  platform: string;
  published: boolean;
}) => {
  const platformLower = platform.toLowerCase();

  // Map platforms to their logo paths
  const logoMap: Record<string, string> = {
    facebook: '/images/logos/facebook.png',
    instagram: '/images/logos/instagram.png',
    linkedin: '/images/logos/linkedin.png',
    twitter: '/images/logos/twitter.png',
    x: '/images/logos/twitter.png', // Twitter/X uses same logo
    reddit: '/images/logos/reddit.png',
    youtube: '/images/logos/youtube.png',
  };

  const logoPath = logoMap[platformLower];

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20 text-xs font-medium">
      {logoPath && (
        <img
          src={logoPath}
          alt={platform}
          className="h-3.5 w-3.5 object-contain"
          onError={e => {
            // Hide image if it fails to load
            e.currentTarget.style.display = 'none';
          }}
        />
      )}
      <span>{platform}</span>
      <Clock className="h-3 w-3" />
    </div>
  );
};

export default function PostsView({
  initialPosts,
}: {
  initialPosts: UiPost[];
}) {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [posts, setPosts] = useState<UiPost[]>(initialPosts);
  const [filterPosts, setFilterPosts] = useState('all');
  const [filterPlatforms, setFilterPlatforms] = useState('all');
  const [filterProfiles, setFilterProfiles] = useState('all');
  const [filterDates, setFilterDates] = useState('all');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>(
    {}
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const getPostDate = (post: UiPost) => {
    const d = new Date(post.scheduled || post.created || 0);
    return isNaN(d.getTime()) ? null : d;
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return null;
    const d = dayjs(value);
    return d.isValid() ? d.format('MMM D, YYYY h:mm A') : null;
  };

  const isInDateFilter = (post: UiPost): boolean => {
    if (filterDates === 'all') return true;
    const d = getPostDate(post);
    if (!d) return false;
    const now = new Date();

    if (filterDates === 'today') {
      return d.toDateString() === now.toDateString();
    }

    if (filterDates === 'week') {
      const day = now.getDay();
      const diffToStart = (day + 6) % 7;
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      start.setDate(now.getDate() - diffToStart);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return d >= start && d <= end;
    }

    if (filterDates === 'month') {
      return (
        d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
      );
    }

    return true;
  };

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesStatus =
        filterPosts === 'all' ? true : post.status === filterPosts;
      const matchesPlatform =
        filterPlatforms === 'all'
          ? true
          : post.platforms.includes(filterPlatforms);
      const matchesProfile =
        filterProfiles === 'all'
          ? true
          : (post as any).profileId
            ? (post as any).profileId === filterProfiles
            : true;
      const matchesDate = isInDateFilter(post);

      return matchesStatus && matchesPlatform && matchesProfile && matchesDate;
    });
  }, [posts, filterPosts, filterPlatforms, filterProfiles, filterDates]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      parseCSVPreview(file);
    } else {
      toast({
        title: 'Invalid file type',
        description: 'Please select a CSV file',
        variant: 'destructive',
      });
    }
  };

  const parseCSVPreview = async (file: File) => {
    const text = await file.text();
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    const preview = lines
      .slice(1, 6)
      .map(line => {
        const values = line.split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      })
      .filter(row => Object.values(row).some(val => val));

    setImportPreview(preview);
  };

  const handleImportCSV = async () => {
    if (!csvFile) return;

    setIsImporting(true);
    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      const response = await fetch('/api/import-csv', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Import successful',
          description: `${result.imported} posts imported successfully`,
        });
        setShowImportDialog(false);
        setCsvFile(null);
        setImportPreview([]);
      } else {
        toast({
          title: 'Import failed',
          description: result.error || 'Failed to import posts',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Import failed',
        description: 'An error occurred while importing posts',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const downloadCSVTemplate = () => {
    const csvContent = `content,scheduled_time,platforms,timezone,media_url
"Your post content here","2025-08-21 15:30:00","instagram;facebook","America/New_York","https://example.com/image.jpg"
"Another post example","2025-08-22 10:00:00","linkedin","UTC",""
"Third post without media","2025-08-23 14:15:00","twitter;instagram","America/Los_Angeles",""`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'posts_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const toggleExpand = (postId: string) => {
    setExpandedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleDeleteClick = (postId: string) => {
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;

    setIsDeleting(true);
    try {
      const result = await client.posts.delete({ id: postToDelete });

      if (result.success) {
        // Remove from local state
        setPosts(prev => prev.filter(p => p.id !== postToDelete));
        toast({
          title: 'Post deleted',
          description: 'The post has been deleted successfully',
        });
        setDeleteDialogOpen(false);
        setPostToDelete(null);
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete post',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const CONTENT_PREVIEW_LENGTH = 150;

  return (
    <div className="bg-background p-4 rounded-2xl space-y-8">
      <div className="space-y-8">
        {/* Filters and View Toggle */}
        <div className="bg-card rounded-xl border border-border p-4 lg:p-5 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <div
                className={`${showFilters ? 'flex' : 'hidden'} lg:flex flex-wrap items-center gap-2 lg:gap-3`}
              >
                <Select value={filterPosts} onValueChange={setFilterPosts}>
                  <SelectTrigger className="w-32 lg:w-36">
                    <SelectValue placeholder="All posts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All posts</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filterPlatforms}
                  onValueChange={setFilterPlatforms}
                >
                  <SelectTrigger className="w-36 lg:w-40">
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

                <Select
                  value={filterProfiles}
                  onValueChange={setFilterProfiles}
                >
                  <SelectTrigger className="w-32 lg:w-36">
                    <SelectValue placeholder="All profiles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All profiles</SelectItem>
                    <SelectItem value="profile1">ThinkRoman</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterDates} onValueChange={setFilterDates}>
                  <SelectTrigger className="w-32 lg:w-36">
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
            </div>

            <div className="flex items-center gap-2 border border-border rounded-lg p-1">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={
                  viewMode === 'list'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground'
                }
              >
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                className={
                  viewMode === 'calendar'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground'
                }
              >
                <Calendar className="h-4 w-4 mr-2" />
                Calendar
              </Button>
              <Link href="/dashboard/create-post">
                <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="h-4 w-4" />
                  <span>Create Post</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {loading && (
            <div className="bg-card rounded-xl border border-border p-8 lg:p-12 text-center shadow-sm">
              <p className="text-muted-foreground">Loading posts...</p>
            </div>
          )}
          {error && !loading && (
            <div className="bg-card rounded-xl border border-destructive p-8 lg:p-12 text-center shadow-sm">
              <p className="text-destructive">{error}</p>
            </div>
          )}
          {!loading && !error && filteredPosts.length === 0 && (
            <div className="bg-card rounded-xl border border-border p-12 lg:p-16 text-center shadow-sm">
              <FileText className="h-12 w-12 lg:h-16 lg:w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-base lg:text-lg">
                No posts found
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Try adjusting your filters or create a new post
              </p>
            </div>
          )}
          {!loading &&
            !error &&
            filteredPosts.map(post => (
              <div
                key={post.id}
                className="bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-4 lg:p-6">
                  <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                    {/* Post Image */}
                    <div className="w-full lg:w-32 h-48 lg:h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0 relative">
                      {post.image ? (
                        <img
                          src={post.image}
                          alt="Post preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-10 w-10 lg:h-12 lg:w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Post Content */}
                    <div className="flex-1 min-w-0">
                      <div className="mb-3 lg:mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          {post.status === 'published' ? (
                            <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-400/30">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Published
                            </Badge>
                          ) : post.status === 'scheduled' ? (
                            <Badge className="bg-primary/15 text-primary border-primary/30">
                              <Clock className="h-3 w-3 mr-1" />
                              Scheduled
                            </Badge>
                          ) : post.status === 'error' ? (
                            <Badge className="bg-destructive/15 text-destructive border-destructive/30">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Error
                            </Badge>
                          ) : (
                            <Badge className="bg-muted text-muted-foreground border-border">
                              <FileText className="h-3 w-3 mr-1" />
                              Draft
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm lg:text-base text-foreground leading-relaxed break-words">
                          {(() => {
                            const displayContent = getDisplayContent(
                              post.content
                            );
                            const shouldTruncate =
                              displayContent.length > CONTENT_PREVIEW_LENGTH;
                            const isExpanded = expandedPosts[post.id];

                            return (
                              <>
                                <p>
                                  {isExpanded || !shouldTruncate
                                    ? displayContent
                                    : `${displayContent.substring(0, CONTENT_PREVIEW_LENGTH)}...`}
                                </p>
                                {shouldTruncate && (
                                  <button
                                    onClick={() => toggleExpand(post.id)}
                                    className="text-primary hover:text-primary/80 mt-1 text-sm underline cursor-pointer"
                                  >
                                    {isExpanded ? 'show less' : 'show more'}
                                  </button>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Post Meta */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 lg:gap-3 mb-3 lg:mb-4">
                        <div className="flex items-center gap-2 text-xs lg:text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">
                            Scheduled:
                          </span>
                          <span>
                            {formatDateTime(post.scheduled) || 'Not scheduled'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs lg:text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">
                            Created:
                          </span>
                          <span>{formatDateTime(post.created) || '—'}</span>
                        </div>
                      </div>

                      {/* Platforms and Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {post.platforms.map(platform => (
                            <PlatformBadge
                              key={platform}
                              platform={platform}
                              published={false}
                            />
                          ))}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Link href={`/dashboard/create-post?edit=${post.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2 text-blue-600 border-blue-600 hover:bg-blue-50 hover:text-blue-700"
                            >
                              <Edit className="h-4 w-4" />
                              <span className="hidden sm:inline">Edit</span>
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(post.id)}
                            className="gap-2 text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="hidden sm:inline">Delete</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <CalendarView posts={filteredPosts} />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
