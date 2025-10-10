'use client';

import React from 'react';

type Profile = { id: string; name?: string; slug?: string };
type RawProfile = {
  _id: string;
  name?: string;
  slug?: string;
  isDefault?: boolean;
  [key: string]: unknown;
};

type ProfileContextValue = {
  profileId: string | null;
  profiles: Profile[];
  loading: boolean;
  setProfileId: (id: string) => void;
};

const ProfileContext = React.createContext<ProfileContextValue | null>(null);

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    ?.split('; ')
    .find(c => c.startsWith(name + '='));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = React.useState<Profile[]>([]);
  const [profileId, setProfileIdState] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    const fromCookie = getCookie('profile_id');
    let fromStorage: string | null = null;
    try {
      fromStorage = localStorage.getItem('profile_id');
    } catch {}
    const initial = fromCookie || fromStorage;
    if (initial) setProfileIdState(initial);

    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/late/profiles');
        const data = await res.json();
        if (!mounted) return;
        const rawList: RawProfile[] = Array.isArray(data?.profiles)
          ? data.profiles
          : Array.isArray(data)
            ? data
            : [];
        const normalized: Profile[] = rawList.map(p => ({
          id: (p as RawProfile)._id,
          name: p.name,
          slug: (p as any).slug,
        }));
        setProfiles(normalized);
        if (!initial && normalized.length > 0) {
          const defaultProfile = rawList.find(p => p.isDefault) || rawList[0];
          const defaultId = defaultProfile?._id;
          if (defaultId) {
            setProfileIdState(defaultId);
            document.cookie = `profile_id=${encodeURIComponent(
              defaultId
            )}; path=/; max-age=${60 * 60 * 24 * 30}`;
            try {
              localStorage.setItem('profile_id', defaultId);
            } catch {}
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const setProfileId = (id: string) => {
    setProfileIdState(id);
    document.cookie = `profile_id=${encodeURIComponent(id)}; path=/; max-age=${
      60 * 60 * 24 * 30
    }`;
    try {
      localStorage.setItem('profile_id', id);
    } catch {}
  };

  const value = React.useMemo(
    () => ({ profileId, profiles, loading, setProfileId }),
    [profileId, profiles, loading]
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = React.useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
