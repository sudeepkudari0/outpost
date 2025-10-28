export type UserRole = 'ADMIN' | 'USER';

export type SidebarIconName =
  | 'Home'
  | 'FileText'
  | 'LucideLink'
  | 'Key'
  | 'Users'
  | 'Plus';

export type SidebarNavSection = {
  title: string;
  items: {
    name: string;
    href: string;
    icon: SidebarIconName;
    description?: string;
  }[];
};

export function getDashboardSidebarNavigation(
  role: UserRole
): SidebarNavSection[] {
  const base: SidebarNavSection[] = [
    {
      title: 'MAIN',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: 'Home' },
        { name: 'Posts', href: '/dashboard/posts', icon: 'FileText' },
        {
          name: 'Connections',
          href: '/dashboard/connections',
          icon: 'LucideLink',
        },
      ],
    },
    {
      title: 'ACTIVE',
      items: [
        {
          name: 'Create Post',
          href: '/dashboard/create-post',
          icon: 'Plus',
          description: 'create and manage social posts',
        },
      ],
    },
  ];

  // Add developer section for all roles
  const developer: SidebarNavSection = {
    title: 'DEVELOPER',
    items: [{ name: 'API Access', href: '/dashboard/api-keys', icon: 'Key' }],
  };

  if (role === 'ADMIN') {
    // Admins get extra management links
    return [
      base[0],
      developer,
      {
        title: 'ADMIN',
        items: [{ name: 'Users', href: '/dashboard/users', icon: 'Users' }],
      },
      base[1],
    ];
  }

  return [base[0], developer, base[1]];
}
