import { ReactNode } from 'react';
import UserLayoutClient from '@/hooks/UserLayoutClient';

const UserLayout = ({ children }: { children: ReactNode }) => {
  return <UserLayoutClient>{children}</UserLayoutClient>;
};

export default UserLayout;
