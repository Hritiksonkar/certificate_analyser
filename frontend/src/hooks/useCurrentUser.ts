import { useInternetIdentity } from './useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerAdmin } from './useQueries';

export function useCurrentUser() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();

  return {
    isAuthenticated,
    userProfile,
    isAdmin: isAdmin || false,
    isLoading: profileLoading || adminLoading,
    principal: identity?.getPrincipal(),
  };
}
