// Mock backend declarations for development
// This file will be replaced by actual declarations when dfx deploy is run
import { Principal } from '@dfinity/principal';

export const idlFactory = ({ IDL }: any) => {
    return IDL.Service({});
};

export const createActor = (canisterId: string, options: any) => {
    // Return a mock actor for development
    return {
        getCallerUserProfile: async () => null,
        saveCallerUserProfile: async (profile: any) => { },
        getCallerUserRole: async () => 'admin', // Default to admin for easier testing
        isCallerAdmin: async () => true,
        issueCertificate: async (input: any, hash: string, url: string) => ({
            id: BigInt(Math.floor(Math.random() * 1000)),
            studentName: input.studentName,
            studentId: input.studentId,
            degree: input.degree,
            year: input.year,
            issuer: Principal.fromText('aaaaa-aa'),
            issuedAt: BigInt(Date.now() * 1000000),
            hash: hash,
            certificateUrl: url,
        }),
        getCertificateById: async (id: bigint) => null,
        getCertificatesByStudentId: async (studentId: string) => [],
        getCertificateHistory: async (pageIndex: bigint, pageSize: bigint) => ({
            certificates: [],
            pageIndex,
            pageSize,
            totalCertificates: BigInt(0),
        }),
        verifyCertificate: async (payload: any, hashes: any) => ({
            isValid: false,
            verificationId: 'mock-v-id'
        }),
        assignCallerUserRole: async (user: Principal, role: string) => { },
    };
};

export const canisterId = 'mock-canister-id';
