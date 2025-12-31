'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LifeTimeline from '../components/timeline/LifeTimeline';
import { useTimeline } from '@/hooks/useTimeline';

export default function TimelineContainer() {
  const { chapters, events, loading, refresh } = useTimeline();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkLogin() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/check-auth/`, {
          credentials: 'include',
        });

        const data = await res.json();
        console.log('Auth status:', data.authenticated);

        if (!mounted) return;

        // Only redirect if explicitly false
        if (data.authenticated === false) {
          router.push('/login');
        } else {
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Failed to check auth:', err);
        if (mounted) router.push('/login');
      }
    }

    checkLogin();

    return () => {
      mounted = false;
    };
  }, [router]);

  // Wait until both timeline and auth status are loaded
  if (loading || isAuthenticated === null) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '16px',
        color: '#666'
      }}>
        Loading timeline...
      </div>
    );
  }

  return <LifeTimeline chapters={chapters} events={events} refresh={refresh} />;
}
