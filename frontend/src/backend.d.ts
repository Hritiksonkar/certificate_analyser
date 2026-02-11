// This file defines the types that match the backend Motoko actor
import { Principal } from '@dfinity/principal';

export interface UserProfile {
    name: string;
    studentId?: string;
}

export interface CertificateInput {
    studentName: string;
    studentId: string;
    degree: string;
    year: bigint;
}

export interface Certificate extends CertificateInput {
    id: bigint;
    issuer: Principal;
    issuedAt: bigint;
    hash: string;
    certificateUrl: string;
}

export interface CertificateHistory {
    certificates: Certificate[];
    pageIndex: bigint;
    pageSize: bigint;
    totalCertificates: bigint;
}

export interface VerifyCertificatePayload {
    studentName: string;
    studentId: string;
    degree: string;
    year: bigint;
    hash: string;
}

export interface CertificateVerificationResult {
    isValid: boolean;
    certificate?: Certificate;
    verificationId: string;
}

export type UserRole = 'admin' | 'user' | 'guest';

export interface BackendActor {
    getCallerUserProfile: () => Promise<UserProfile | null>;
    saveCallerUserProfile: (profile: UserProfile) => Promise<void>;
    getUserProfile: (user: Principal) => Promise<UserProfile | null>;
    issueCertificate: (input: CertificateInput, hash: string, url: string) => Promise<Certificate>;
    getCertificateById: (id: bigint) => Promise<Certificate | null>;
    getCertificatesByStudentId: (studentId: string) => Promise<Certificate[]>;
    verifyCertificate: (payload: VerifyCertificatePayload, hashes: [string, string][]) => Promise<CertificateVerificationResult>;
    getCertificateHistory: (pageIndex: bigint, pageSize: bigint) => Promise<CertificateHistory>;
    isCallerAdmin: () => Promise<boolean>;
    getCallerUserRole: () => Promise<UserRole>;
    assignCallerUserRole: (user: Principal, role: UserRole) => Promise<void>;
}
