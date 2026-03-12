export interface CustomOffer {
  _id: string;
  assignment: string;
  conversation: string;
  tutor: string;
  student: string;
  proposedBudget: number;
  proposedDeadline: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: string;
  expiresAt: string;
}
