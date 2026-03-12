import { UserRoundPen, BookOpenCheck, CircleCheck, type LucideIcon } from 'lucide-react';

export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: 'Personal Info',
    description: 'Tell us about yourself',
    icon: UserRoundPen,
  },
  {
    id: 2,
    title: 'Take a little Quiz',
    description: 'Prove how smart you are',
    icon: BookOpenCheck,
  },
  {
    id: 3,
    title: 'Approval Summary',
    description: 'You are almost done!',
    icon: CircleCheck,
  },
];
