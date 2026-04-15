export function getSidebarItems(roles: string[], userId?: string, active?: string) {
  const isTutor = roles.includes('tutor');

  if (isTutor) {
    return [
      {
        name: 'Home',
        icon: '/assets/icons/dashboard.png',
        href: '/user/dashboard',
        active: active === 'dashboard',
      },
      {
        name: 'My Profile',
        icon: '/assets/icons/tutor.png',
        href: userId ? `/user/tutors/tutor-profile/${userId}` : '#',
        active: active === 'tutor-profile',
      },
      {
        name: 'All Assignments',
        icon: '/assets/icons/tasks.png',
        href: '/user/assignments',
        active: active === 'assignments',
      },
      {
        name: 'Ongoing Projects',
        icon: '/assets/icons/folder-icon.png',
        href: '/user/projects',
        active: active === 'projects',
      },
      {
        name: 'Calendar',
        icon: '/assets/icons/calender-icon.png',
        href: '/user/calendar',
        active: active === 'calendar',
      },
      {
        name: 'Inbox',
        icon: '/assets/icons/inbox.png',
        href: '/user/messages',
        active: active === 'messages',
      },
      {
        name: 'Wallet',
        icon: '/assets/icons/rocket.png',
        href: '/user/wallet',
        active: active === 'wallet',
      },
    ];
  }

  return [
    {
      name: 'Home',
      icon: '/assets/icons/dashboard.png',
      href: '/user/dashboard',
      active: active === 'dashboard',
    },
    {
      name: 'Tutors',
      icon: '/assets/icons/tutor.png',
      href: '/user/tutors',
      active: active === 'tutors',
    },
    {
      name: 'My Assignments',
      icon: '/assets/icons/tasks.png',
      href: '/user/assignments',
      active: active === 'assignments',
    },
    {
      name: 'Calendar',
      icon: '/assets/icons/calender-icon.png',
      href: '/user/calendar',
      active: active === 'calendar',
    },
    {
      name: 'Inbox',
      icon: '/assets/icons/inbox.png',
      href: '/user/messages',
      active: active === 'messages',
    },
  ];
}