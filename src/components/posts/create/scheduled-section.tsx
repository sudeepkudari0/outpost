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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { timezones } from './constants';

type Props = {
  busy: boolean;
  publishingOption: string;
  setPublishingOption: (v: string) => void;
  scheduledDate: string;
  setScheduledDate: (v: string) => void;
  scheduledTime: string;
  setScheduledTime: (v: string) => void;
  timezone: string;
  setTimezone: (v: string) => void;
  onSubmit: () => void;
  canSubmit: boolean;
};

export function ScheduleSection({
  busy,
  publishingOption,
  setPublishingOption,
  scheduledDate,
  setScheduledDate,
  scheduledTime,
  setScheduledTime,
  timezone,
  setTimezone,
  onSubmit,
  canSubmit,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Publishing</CardTitle>
        <CardDescription>Choose how to handle your content</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label className="text-base font-medium">Publishing Options</Label>
          <RadioGroup
            value={publishingOption}
            onValueChange={setPublishingOption}
            className="space-y-3"
          >
            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="now" id="publish-now" />
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <Label
                  htmlFor="publish-now"
                  className="font-medium cursor-pointer"
                >
                  Publish now
                </Label>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="schedule" id="schedule-later" />
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <Label
                  htmlFor="schedule-later"
                  className="font-medium cursor-pointer"
                >
                  Schedule for later
                </Label>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="draft" id="save-draft" />
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <Label
                  htmlFor="save-draft"
                  className="font-medium cursor-pointer"
                >
                  Save as draft
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        {publishingOption === 'schedule' && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
            <Label className="text-base font-medium">Schedule for</Label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduled-date">Date</Label>
                <Input
                  id="scheduled-date"
                  type="date"
                  value={scheduledDate}
                  onChange={e => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduled-time">Time</Label>
                <Input
                  id="scheduled-time"
                  type="time"
                  value={scheduledTime}
                  onChange={e => setScheduledTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map(tz => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {scheduledDate && scheduledTime && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                <p className="text-blue-800">
                  <strong>Scheduled for:</strong>{' '}
                  {new Date(
                    `${scheduledDate}T${scheduledTime}`
                  ).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    timeZone: timezone,
                  })}
                </p>
              </div>
            )}
          </div>
        )}

        <Button
          onClick={onSubmit}
          disabled={busy || !canSubmit}
          className="w-full"
          size="lg"
        >
          {busy
            ? 'Processing...'
            : publishingOption === 'now'
              ? 'Publish Now'
              : publishingOption === 'schedule'
                ? 'Schedule Post'
                : 'Save as Draft'}
        </Button>
      </CardContent>
    </Card>
  );
}
