'use client';

import { Megaphone, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAdminBroadcastLogic } from '../hooks/useAdminBroadcastLogic';

export const AdminBroadcastClient = () => {
  const {
    targetAudience,
    setTargetAudience,
    title,
    setTitle,
    message,
    setMessage,
    link,
    setLink,
    isSubmitting,
    handleBroadcast,
  } = useAdminBroadcastLogic();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Broadcast Notifications</h1>
        <p className="text-sm text-gray-500">Send an in-app notification to thousands of users at once.</p>
      </div>

      <Card className="border border-gray-200/70 bg-white/90 shadow-sm max-w-3xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Megaphone className="h-5 w-5" />
            </span>
            <div>
              <CardTitle className="text-base font-semibold">Compose Broadcast</CardTitle>
              <CardDescription>
                This will trigger an alert in the selected users' dashboard notifications.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Target Audience</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'all', label: 'All Users' },
                { id: 'tutors', label: 'Tutors Only' },
                { id: 'students', label: 'Students Only' },
              ].map((audience) => (
                <label
                  key={audience.id}
                  className={`flex cursor-pointer items-center justify-center rounded-lg border p-3 text-sm font-medium transition-colors ${
                    targetAudience === audience.id
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="targetAudience"
                    value={audience.id}
                    checked={targetAudience === audience.id}
                    onChange={() => setTargetAudience(audience.id as any)}
                    className="hidden"
                  />
                  {audience.label}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Title <span className="text-rose-500">*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. System Maintenance Update"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Message <span className="text-rose-500">*</span></label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Write your announcement here..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-y"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Call to Action Link (Optional)</label>
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="e.g. /settings or https://aski.com/updates"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500">If provided, the notification will redirect here when clicked.</p>
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              onClick={handleBroadcast}
              disabled={isSubmitting || !title.trim() || !message.trim()}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Sending...' : 'Send Broadcast'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
