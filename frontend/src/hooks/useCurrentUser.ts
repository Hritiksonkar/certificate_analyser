import { useInternetIdentity } from './useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerAdmin } from './useQueries';

export function useCurrentUser() {
  const { identity } = useInternetIdentity();

  // Check for email-based admin login
  const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  const adminRole = typeof window !== 'undefined' ? localStorage.getItem('user_role') : null;
  const isEmailAdmin = !!adminToken && adminRole === 'admin';

  const isInternetIdentityAuthenticated = !!identity;
  const isAuthenticated = isInternetIdentityAuthenticated || isEmailAdmin;

  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: isCanisterAdmin, isLoading: adminLoading } = useIsCallerAdmin();

  return {
    isAuthenticated,
    isInternetIdentityAuthenticated,
    isEmailAdmin,
    userProfile: isEmailAdmin ? { name: 'System Admin' } : userProfile,
    isCanisterAdmin: isCanisterAdmin || false,
    isAdmin: isCanisterAdmin || isEmailAdmin || false,
    isLoading: profileLoading || adminLoading,
    principal: identity?.getPrincipal(),
    logout: () => {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('user_role');
    }
  };
}
