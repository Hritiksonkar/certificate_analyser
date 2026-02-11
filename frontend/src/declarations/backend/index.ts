import { Actor, type ActorConfig, type ActorSubclass } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';
import type { Principal } from '@dfinity/principal';

export const canisterId: string =
	(import.meta as any).env?.CANISTER_ID_BACKEND ??
	(process.env as any).CANISTER_ID_BACKEND ??
	'';

// Manual candid interface for `backend/main.mo`.
// This avoids needing `dfx generate` while keeping runtime behavior correct.
export const idlFactory: IDL.InterfaceFactory = ({ IDL }) => {
	const UserRole = IDL.Variant({ admin: IDL.Null, user: IDL.Null, guest: IDL.Null });
	const UserProfile = IDL.Record({ name: IDL.Text, studentId: IDL.Opt(IDL.Text) });
	const CertificateInput = IDL.Record({
		studentName: IDL.Text,
		studentId: IDL.Text,
		degree: IDL.Text,
		year: IDL.Nat,
	});
	const Certificate = IDL.Record({
		id: IDL.Nat,
		studentName: IDL.Text,
		studentId: IDL.Text,
		degree: IDL.Text,
		year: IDL.Nat,
		issuer: IDL.Principal,
		issuedAt: IDL.Int,
		hash: IDL.Text,
		certificateUrl: IDL.Text,
	});
	const CertificateHistory = IDL.Record({
		certificates: IDL.Vec(Certificate),
		pageIndex: IDL.Nat,
		pageSize: IDL.Nat,
		totalCertificates: IDL.Nat,
	});
	const VerifyCertificatePayload = IDL.Record({
		studentName: IDL.Text,
		studentId: IDL.Text,
		degree: IDL.Text,
		year: IDL.Nat,
		hash: IDL.Text,
	});
	const CertificateVerificationResult = IDL.Record({
		isValid: IDL.Bool,
		certificate: IDL.Opt(Certificate),
		verificationId: IDL.Text,
	});
	const HashPair = IDL.Tuple(IDL.Text, IDL.Text);

	return IDL.Service({
		_initializeAccessControlWithSecret: IDL.Func([IDL.Text], [], []),
		getCallerUserRole: IDL.Func([], [UserRole], ['query']),
		assignCallerUserRole: IDL.Func([IDL.Principal, UserRole], [], []),
		isCallerAdmin: IDL.Func([], [IDL.Bool], ['query']),

		getCallerUserProfile: IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
		saveCallerUserProfile: IDL.Func([UserProfile], [], []),
		getUserProfile: IDL.Func([IDL.Principal], [IDL.Opt(UserProfile)], ['query']),

		issueCertificate: IDL.Func([CertificateInput, IDL.Text, IDL.Text], [Certificate], []),
		getCertificateById: IDL.Func([IDL.Nat], [IDL.Opt(Certificate)], ['query']),
		getCertificatesByStudentId: IDL.Func([IDL.Text], [IDL.Vec(Certificate)], ['query']),
		verifyCertificate: IDL.Func(
			[VerifyCertificatePayload, IDL.Vec(HashPair)],
			[CertificateVerificationResult],
			['query'],
		),
		getCertificateHistory: IDL.Func([IDL.Nat, IDL.Nat], [CertificateHistory], ['query']),
	});
};

export function createActor(
	maybeCanisterId?: string | Principal,
	options?: Omit<ActorConfig, 'canisterId'>,
): ActorSubclass<any> {
	const effectiveCanisterId = maybeCanisterId ?? canisterId;
	if (!effectiveCanisterId) {
		throw new Error('Backend canister ID not found (CANISTER_ID_BACKEND)');
	}

	return Actor.createActor(idlFactory, {
		...(options ?? {}),
		canisterId: effectiveCanisterId,
	});
}
