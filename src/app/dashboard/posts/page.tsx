import PostsView, { type UiPost } from '@/components/posts/posts-view';
import { client } from '@/lib/orpc/server';

export default async function PostsPage() {
  const data = await client.posts.list({ limit: 50 });

  const initialPosts: UiPost[] = (data.posts || []).map((p: any) => ({
    id: p.id || p._id || '',
    content:
      typeof p.content === 'string'
        ? p.content
        : JSON.stringify(p.content ?? ''),
    scheduled: p.scheduledFor ? new Date(p.scheduledFor).toISOString() : null,
    created: p.createdAt ? new Date(p.createdAt).toISOString() : null,
    platforms: Array.isArray(p.platforms)
      ? p.platforms
          .map((x: any) => (typeof x === 'string' ? x : x.platform))
          .map((x: any) =>
            typeof x === 'string' ? x.toLowerCase() : String(x).toLowerCase()
          )
          .filter(Boolean)
      : [],
    status: (p.status || '').toString().toLowerCase(),
    image:
      Array.isArray(p.mediaUrls) && p.mediaUrls.length > 0
        ? p.mediaUrls[0]
        : null,
  }));

  return <PostsView initialPosts={initialPosts} />;
}
