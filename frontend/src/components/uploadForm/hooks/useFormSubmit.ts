import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateAssignmentMutation } from '@/lib/services/assignments';
import { useGenerateSessionIdQuery } from '@/lib/services/student';
import { useAppSelector } from '@/lib/hooks';
import { apiOrigin } from '@/lib/apiConfig';
import type { AssignmentFormData, UploadProjectFormProps } from '../types';

type UseFormSubmitOptions = Pick<
  UploadProjectFormProps,
  'onSubmit' | 'onSuccess' | 'onCreated' | 'requestedTutorId'
> & {
  onReset: () => void;
};

export function useFormSubmit({
  requestedTutorId,
  onSubmit,
  onSuccess,
  onCreated,
  onReset,
}: UseFormSubmitOptions) {
  const [submitError, setSubmitError] = useState('');
  const router = useRouter();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { data: sessionData } = useGenerateSessionIdQuery();
  const [createAssignment, { isLoading: isCreating }] = useCreateAssignmentMutation();

  const buildPayload = (formData: AssignmentFormData, status: string) => {
    const payload = new FormData();
    const meta: Record<string, unknown> = {
      title: formData.title,
      description: formData.description,
      subject: formData.subject || 'General',
      deadline: formData.deadline || new Date().toISOString(),
      estimatedCost: formData.budget || 0,
      priority: 'medium',
      status,
      ...(requestedTutorId ? { requestedTutor: requestedTutorId } : {}),
    };

    Object.entries(meta).forEach(([k, v]) => payload.append(k, String(v)));
    formData.topics.forEach((t) => payload.append('topics', t));
    formData.files.forEach((f) => payload.append('attachments', f));

    return payload;
  };

  const handleAuthenticatedSubmit = async (formData: AssignmentFormData) => {
    try {
      const response = await createAssignment(buildPayload(formData, 'pending')).unwrap();
      onReset();
      if (onCreated && response?.data?._id) onCreated(response.data._id);
      if (onSuccess) onSuccess();
      else if (!onCreated) alert('Assignment posted successfully!');
    } catch (error: unknown) {
      console.error('Failed to create assignment:', error);
      const apiError = error as { data?: { message?: string } };
      setSubmitError(apiError?.data?.message || 'Failed to post assignment. Please try again.');
    }
  };

  const handleAnonymousSubmit = async (formData: AssignmentFormData) => {
    try {
      if (!sessionData?.sessionId) {
        router.push('/account/register');
        return;
      }
      const response = await fetch(`${apiOrigin}/assignments`, {
        method: 'POST',
        body: buildPayload(formData, 'draft'),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || response.statusText);
      }

      const result = await response.json();
      localStorage.setItem('pendingAssignmentId', result.data._id);
    } catch (error) {
      console.error('Failed to save form data:', error);
    } finally {
      router.push('/account/register');
    }
  };

  const handleSubmit = async (e: FormEvent, formData: AssignmentFormData) => {
    e.preventDefault();
    setSubmitError('');

    if (isAuthenticated) {
      if (onSubmit) {
        onSubmit(formData);
      } else {
        await handleAuthenticatedSubmit(formData);
      }
    } else {
      await handleAnonymousSubmit(formData);
    }
  };

  return { submitError, isCreating, handleSubmit };
}
