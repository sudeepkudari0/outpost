'use client';

import dayjs from 'dayjs';
import type React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Edit,
  FileText,
  Filter,
  Image as ImageIcon,
  List,
  MoreVertical,
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
                      {post.content.substring(0, 20)}...
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
  const colors: Record<string, string> = {
    instagram: 'bg-muted text-foreground border-border',
    facebook: 'bg-muted text-foreground border-border',
    linkedin: 'bg-muted text-foreground border-border',
    twitter: 'bg-muted text-foreground border-border',
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${
        colors[platform.toLowerCase()] ||
        'bg-muted text-foreground border-border'
      }`}
    >
      {platform}
      {published && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
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
        <div className=" grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                      <div className="flex items-start justify-between gap-4 mb-3 lg:mb-4">
                        <div className="flex-1">
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
                          <p className="text-sm lg:text-base text-foreground line-clamp-2 lg:line-clamp-3 leading-relaxed break-words break-all">
                            {post.content}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 flex-shrink-0"
                            >
                              <MoreVertical className="h-4 w-4 text-muted-foreground" />
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
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

                      {/* Platforms */}
                      <div className="flex flex-wrap items-center gap-2">
                        {post.platforms.map(platform => (
                          <PlatformBadge
                            key={platform}
                            platform={platform}
                            published={post.status === 'published'}
                          />
                        ))}
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
    </div>
  );
}
