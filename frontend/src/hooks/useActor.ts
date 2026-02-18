import { useEffect, useMemo, useState } from 'react';
import { HttpAgent } from '@dfinity/agent';
import { createActor as createBackendActor } from 'declarations/backend';
import { useInternetIdentity } from './useInternetIdentity';

export type BackendActor = any;

function readEnv(name: string): string | undefined {
    const metaEnv = (import.meta as any)?.env ?? {};
    const fromMeta = metaEnv[name] ?? metaEnv[`VITE_${name}`];
    if (typeof fromMeta === 'string' && fromMeta.trim()) return fromMeta;
    const procEnv = typeof process !== 'undefined' ? (process as any).env : undefined;
    const fromProcess = procEnv?.[name] ?? procEnv?.[`VITE_${name}`];
    if (typeof fromProcess === 'string' && fromProcess.trim()) return fromProcess;
    return undefined;
}

export function useActor() {
    const { identity } = useInternetIdentity();
    const [actor, setActor] = useState<BackendActor | null>(null);
    const [isFetching, setIsFetching] = useState(true);

    const canisterId = useMemo(() => readEnv('CANISTER_ID_BACKEND'), []);
    const network = useMemo(() => readEnv('DFX_NETWORK') ?? 'ic', []);
    const host = network === 'local' ? 'http://localhost:4943' : 'https://ic0.app';

    useEffect(() => {
        void createActor();
    }, [identity, canisterId, host, network]);

    async function createActor() {
        try {
            setIsFetching(true);
            if (!canisterId) {
                console.warn('Backend canister ID not found. Please deploy the backend canister first.');
                setActor(null);
                setIsFetching(false);
                return;
            }

            const agent = new HttpAgent({
                identity: identity || undefined,
                host,
            });

            // Fetch root key for local development
            if (network === 'local') {
                await agent.fetchRootKey();
            }

            const backendActor = createBackendActor(canisterId, { agent });
            setActor(backendActor);

            setIsFetching(false);
        } catch (error) {
            console.error('Error creating actor:', error);
            setActor(null);
            setIsFetching(false);
        }
    }

    return { actor, isFetching };
}
