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
        { name: 'Team', href: '/dashboard/team', icon: 'Users' },
        {
          name: 'API Keys',
          href: '/dashboard/api-keys',
          icon: 'Key',
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
    // Admins: hide Posts, Connections, Team, Create Post, and Developer
    const adminMain: SidebarNavSection = {
      title: base[0].title,
      items: base[0].items.filter(
        i => i.name !== 'Posts' && i.name !== 'Connections' && i.name !== 'Team'
      ),
    };

    // Filter ACTIVE to remove Create Post for admins
    const adminActive: SidebarNavSection = {
      title: base[1].title,
      items: base[1].items.filter(i => i.name !== 'Create Post'),
    };

    const sections: SidebarNavSection[] = [
      adminMain,
      {
        title: 'ADMIN',
        items: [{ name: 'Users', href: '/dashboard/users', icon: 'Users' }],
      },
    ];

    if (adminActive.items.length > 0) sections.push(adminActive);

    return sections;
  }

  return [base[0], base[1]];
}
