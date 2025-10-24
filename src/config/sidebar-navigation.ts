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

  if (role === 'ADMIN') {
    // Admins get extra management links
    return [
      base[0],
      {
        title: 'ADMIN',
        items: [
          { name: 'API Keys', href: '/dashboard/api-keys', icon: 'Key' },
          { name: 'Users', href: '/dashboard/users', icon: 'Users' },
        ],
      },
      base[1],
    ];
  }

  return base;
}
