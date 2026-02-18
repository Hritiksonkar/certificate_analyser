import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Principal } from '@dfinity/principal';
import { useActor } from './useActor';
import { UserProfile, CertificateInput, UserRole, Certificate, CertificateHistory } from '../backend';

type CandidOpt<T> = [] | [T];
type CandidVariant<T extends string> = { [K in T]?: null };

function unwrapOpt<T>(value: unknown): T | null {
  if (value === null || value === undefined) return null;
  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    if (value.length === 1) return value[0] as T;
  }
  return value as T;
}

function fromCandidUserRole(value: unknown): UserRole {
  if (typeof value === 'string') return value as UserRole;
  if (value && typeof value === 'object') {
    const v = value as Record<string, unknown>;
    if ('admin' in v) return 'admin';
    if ('user' in v) return 'user';
    if ('guest' in v) return 'guest';
  }
  return 'guest';
}

function toCandidUserRole(role: UserRole): CandidVariant<UserRole> {
  switch (role) {
    case 'admin':
      return { admin: null };
    case 'user':
      return { user: null };
    case 'guest':
    default:
      return { guest: null };
  }
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const raw = await actor.getCallerUserProfile();
      return unwrapOpt<UserProfile>(raw);
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

  return useQuery<UserRole>({
    queryKey: ['currentUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const raw = await actor.getCallerUserRole();
      return fromCandidUserRole(raw);
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

  return useQuery<Certificate | null>({
    queryKey: ['certificate', id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) throw new Error('Actor or ID not available');
      const raw = await actor.getCertificateById(id);
      return unwrapOpt<Certificate>(raw);
    },
    enabled: !!actor && !actorFetching && id !== null,
  });
}

export function useGetCertificatesByStudentId(studentId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Certificate[]>({
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

  return useQuery<CertificateHistory>({
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
    mutationFn: async ({ user, role }: { user: Principal; role: UserRole }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.assignCallerUserRole(user, toCandidUserRole(role));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserRole'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
    },
  });
}

