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
import { Calendar, Clock, FileText, Zap } from 'lucide-react';

const timezones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time' },
  { value: 'America/Los_Angeles', label: 'Pacific Time' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Asia/Kolkata', label: 'India Standard Time' },
];

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
  const options = [
    {
      value: 'now',
      label: 'Publish Now',
      icon: Zap,
      color: 'emerald',
    },
    {
      value: 'schedule',
      label: 'Schedule',
      icon: Clock,
      color: 'violet',
    },
    {
      value: 'draft',
      label: 'Draft',
      icon: FileText,
      color: 'amber',
    },
  ];

  const getButtonClasses = () => {
    const base = 'w-full font-medium transition-all';
    if (publishingOption === 'now') {
      return `${base} bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600`;
    }
    if (publishingOption === 'schedule') {
      return `${base} bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600`;
    }
    return `${base} bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600`;
  };

  return (
    <Card className="w-full border dark:border-gray-800 dark:bg-gray-950">
      <CardHeader className="">
        <CardTitle className="text-lg dark:text-gray-100">Publishing</CardTitle>
        <CardDescription className="dark:text-gray-400">
          Choose when to publish your content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={publishingOption}
          onValueChange={setPublishingOption}
          className="grid grid-cols-3 gap-2"
        >
          {options.map(option => {
            const Icon = option.icon;
            const isSelected = publishingOption === option.value;

            return (
              <label
                key={option.value}
                className={`relative flex flex-col items-center gap-2 p-2 md:p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected
                    ? option.color === 'emerald'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-600'
                      : option.color === 'violet'
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30 dark:border-violet-600'
                        : 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-600'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700 bg-white dark:bg-gray-900'
                }`}
              >
                <RadioGroupItem
                  value={option.value}
                  id={option.value}
                  className="sr-only"
                />

                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    isSelected
                      ? option.color === 'emerald'
                        ? 'bg-emerald-500 dark:bg-emerald-600'
                        : option.color === 'violet'
                          ? 'bg-violet-500 dark:bg-violet-600'
                          : 'bg-amber-500 dark:bg-amber-600'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}
                  />
                </div>

                <span
                  className={`text-xs md:text-sm font-medium ${isSelected ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}
                >
                  {option.label}
                </span>

                {isSelected && (
                  <div
                    className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${
                      option.color === 'emerald'
                        ? 'bg-emerald-500 dark:bg-emerald-600'
                        : option.color === 'violet'
                          ? 'bg-violet-500 dark:bg-violet-600'
                          : 'bg-amber-500 dark:bg-amber-600'
                    }`}
                  >
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </label>
            );
          })}
        </RadioGroup>

        {publishingOption === 'schedule' && (
          <div className="space-y-3 p-4 rounded-lg border border-violet-200 bg-violet-50/50 dark:border-violet-900 dark:bg-violet-950/20">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="scheduled-date"
                  className="text-sm dark:text-gray-300"
                >
                  Date
                </Label>
                <Input
                  id="scheduled-date"
                  type="date"
                  value={scheduledDate}
                  onChange={e => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="scheduled-time"
                  className="text-sm dark:text-gray-300"
                >
                  Time
                </Label>
                <Input
                  id="scheduled-time"
                  type="time"
                  value={scheduledTime}
                  onChange={e => setScheduledTime(e.target.value)}
                  className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="timezone" className="text-sm dark:text-gray-300">
                Timezone
              </Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100">
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
              <div className="flex items-start gap-2 p-3 bg-white dark:bg-gray-900 rounded-lg border border-violet-200 dark:border-violet-800">
                <Calendar className="w-4 h-4 text-violet-600 dark:text-violet-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {new Date(
                      `${scheduledDate}T${scheduledTime}`
                    ).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      timeZone: timezone,
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <Button
          onClick={onSubmit}
          disabled={busy || !canSubmit}
          className={getButtonClasses()}
        >
          {busy ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </div>
          ) : publishingOption === 'now' ? (
            'Publish Now'
          ) : publishingOption === 'schedule' ? (
            'Schedule Post'
          ) : (
            'Save as Draft'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
