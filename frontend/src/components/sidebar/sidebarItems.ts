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
  ];
}
