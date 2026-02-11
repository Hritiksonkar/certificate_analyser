import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { UserProfile, CertificateInput } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['currentUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useInitializeAccessControl() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userSecret: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor._initializeAccessControlWithSecret(userSecret);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserRole'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useIssueCertificate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ input, hash, url }: { input: CertificateInput; hash: string; url: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.issueCertificate(input, hash, url);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificateHistory'] });
    },
  });
}

export function useGetCertificateById(id: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['certificate', id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) throw new Error('Actor or ID not available');
      return actor.getCertificateById(id);
    },
    enabled: !!actor && !actorFetching && id !== null,
  });
}

export function useGetCertificatesByStudentId(studentId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['certificates', 'student', studentId],
    queryFn: async () => {
      if (!actor || !studentId) throw new Error('Actor or student ID not available');
      return actor.getCertificatesByStudentId(studentId);
    },
    enabled: !!actor && !actorFetching && !!studentId,
  });
}

export function useGetCertificateHistory(pageIndex: number, pageSize: number) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['certificateHistory', pageIndex, pageSize],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCertificateHistory(BigInt(pageIndex), BigInt(pageSize));
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAssignUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, role }: { user: any; role: any }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.assignCallerUserRole(user, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserRole'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
    },
  });
}

