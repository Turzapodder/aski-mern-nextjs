export interface UploadProjectFormProps {
  onSubmit?: (formData: AssignmentFormData) => void;
  onSuccess?: () => void;
  onCreated?: (assignmentId: string) => void;
  onCancel?: () => void;
  onSaveDraft?: (formData: AssignmentFormData) => void;
  className?: string;
  maxWidth?: string;
  advanced?: boolean;
  requestedTutorId?: string;
  requestedTutorName?: string;
}

export interface AssignmentFormData {
  title: string;
  description: string;
  deadline: string;
  subject: string;
  topics: string[];
  budget?: number;
  files: File[];
}
