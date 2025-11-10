'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

type MediaItem = {
  url: string;
  type?: 'image' | 'video';
  filename?: string;
  size?: number;
};

type Props = {
  busy: boolean;
  uploading: boolean;
  imageFile: File | null;
  generatedImageUrl: string | null;
  mediaPrompt: string;
  setMediaPrompt: (v: string) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerateImage: () => void;
};

export function MediaSection({
  busy,
  uploading,
  imageFile,
  generatedImageUrl,
  mediaPrompt,
  setMediaPrompt,
  onUpload,
  onGenerateImage,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Media</CardTitle>
        <CardDescription>
          Upload or generate images and videos for your post
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Media</TabsTrigger>
            <TabsTrigger value="generate">Generate Image</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="media-upload">Upload Image or Video</Label>
              <Input
                id="media-upload"
                type="file"
                accept="image/*,video/mp4,video/mov,video/avi,video/quicktime"
                onChange={onUpload}
                disabled={busy}
              />
              {uploading && (
                <p className="text-xs text-muted-foreground">Uploading...</p>
              )}
              <p className="text-xs text-muted-foreground">
                Supported: Images (JPEG, PNG, GIF, WebP) and Videos (MP4, MOV,
                AVI) for Instagram Reels, YouTube Shorts
              </p>
            </div>
            {imageFile && (
              <div className="p-3 bg-muted rounded">
                <p className="text-sm">Selected: {imageFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  Type:{' '}
                  {imageFile.type.startsWith('video/') ? 'Video' : 'Image'} |
                  Size: {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="generate" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="media-prompt">Image Description</Label>
              <Textarea
                id="media-prompt"
                placeholder="Describe the image you want to generate (e.g., 'A modern office workspace with plants and natural lighting')"
                value={mediaPrompt}
                onChange={e => setMediaPrompt(e.target.value)}
              />
            </div>
            <Button
              onClick={onGenerateImage}
              disabled={busy || !mediaPrompt.trim()}
              className="w-full"
            >
              {busy ? 'Generating...' : 'Generate Image with DALL-E'}
            </Button>
            {generatedImageUrl && (
              <div className="space-y-2">
                <Label>Generated Image Preview</Label>
                <div className="border rounded p-2">
                  <img
                    src={generatedImageUrl || '/placeholder.svg'}
                    alt="Generated image"
                    className="max-w-full h-auto rounded"
                    style={{ maxHeight: '300px' }}
                  />
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
