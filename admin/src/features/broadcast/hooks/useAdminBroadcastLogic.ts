import { useState } from 'react';
import { toast } from 'sonner';
import { adminApi } from '@/lib/adminApi';

export const useAdminBroadcastLogic = () => {
  const [targetAudience, setTargetAudience] = useState<'all' | 'tutors' | 'students'>('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBroadcast = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Title and message are required');
      return;
    }

    setIsSubmitting(true);
    try {
      await adminApi.communications.sendBroadcast({
        targetAudience,
        title: title.trim(),
        message: message.trim(),
        link: link.trim() || undefined,
      });
      toast.success('Broadcast sent successfully');
      setTitle('');
      setMessage('');
      setLink('');
      setTargetAudience('all');
    } catch (error: any) {
      toast.error(error?.message || 'Unable to send broadcast');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
  };
};
