import { useInternetIdentity } from './useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerAdmin } from './useQueries';

export function useCurrentUser() {
  const { identity } = useInternetIdentity();

  // Check for email-based admin login
  const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  const adminRole = typeof window !== 'undefined' ? localStorage.getItem('user_role') : null;
  const isEmailAdmin = !!adminToken && adminRole === 'admin';

  const isAuthenticated = !!identity || isEmailAdmin;

  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();

  return {
    isAuthenticated,
    userProfile: isEmailAdmin ? { name: 'System Admin' } : userProfile,
    isAdmin: isAdmin || isEmailAdmin || false,
    isLoading: profileLoading || adminLoading,
    principal: identity?.getPrincipal(),
    logout: () => {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('user_role');
    }
  };
}
