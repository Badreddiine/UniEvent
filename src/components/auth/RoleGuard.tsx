'use client';

import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

type BackendRole = 'ADMIN' | 'DOYEN' | 'RESPONSABLE_EVENEMENTS';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: BackendRole[];
  redirectTo?: string;
}

export function RoleGuard({
  children,
  allowedRoles,
  redirectTo = '/dashboard',
}: RoleGuardProps) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    const userRole = user?.role?.toUpperCase() as BackendRole | undefined;
    if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, user, allowedRoles, redirectTo, router]);

  if (!isAuthenticated) return null;

  const userRole = user?.role?.toUpperCase() as BackendRole | undefined;
  if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
    return null;
  }

  return <>{children}</>;
}
