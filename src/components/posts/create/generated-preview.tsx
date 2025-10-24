'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

type Bundle = Record<string, string | { caption?: string; image?: string }>;

type Props = {
  bundle: Bundle;
  onEdit: (platform: string, value: string) => void;
};

export function GeneratedPreview({ bundle, onEdit }: Props) {
  if (!bundle) return null as any;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Content</CardTitle>
        <CardDescription>Review your platform-specific content</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 border-0 pt-0">
        {Object.entries(bundle).map(([platform, content]) => {
          const isObject = typeof content === 'object' && content !== null;
          const caption = isObject
            ? (content as any).caption
            : String(content ?? '');
          const imageUrl = isObject ? (content as any).image : undefined;
          return (
            <div key={platform} className="space-y-2">
              <Textarea
                value={caption}
                onChange={e => onEdit(platform, e.target.value)}
                className="min-h-[120px]"
              />
              {!caption && !imageUrl && (
                <p className="text-sm">No preview available</p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
