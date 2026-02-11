import { useEffect, useState } from 'react';
import { Actor, HttpAgent } from '@dfinity/agent';
import { useInternetIdentity } from './useInternetIdentity';

// Placeholder type - will be replaced by actual generated types
export type BackendActor = any;

export function useActor() {
    const { identity } = useInternetIdentity();
    const [actor, setActor] = useState<BackendActor | null>(null);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        createActor();
    }, [identity]);

    async function createActor() {
        try {
            setIsFetching(true);

            const canisterId = import.meta.env.CANISTER_ID_BACKEND || process.env.CANISTER_ID_BACKEND;

            if (!canisterId) {
                console.warn('Backend canister ID not found. Please deploy the backend canister first.');
                setActor(null);
                setIsFetching(false);
                return;
            }

            const agent = new HttpAgent({
                identity: identity || undefined,
                host: process.env.DFX_NETWORK === 'local' ? 'http://localhost:4943' : 'https://ic0.app',
            });

            // Fetch root key for local development
            if (process.env.DFX_NETWORK === 'local') {
                await agent.fetchRootKey();
            }

            // Try to import the generated declarations
            try {
                const { createActor: createBackendActor, idlFactory } = await import('declarations/backend');
                const backendActor = createBackendActor(canisterId, {
                    agent,
                });
                setActor(backendActor);
            } catch (error) {
                console.warn('Backend declarations not found. Please run: dfx deploy');
                setActor(null);
            }

            setIsFetching(false);
        } catch (error) {
            console.error('Error creating actor:', error);
            setActor(null);
            setIsFetching(false);
        }
    }

    return { actor, isFetching };
}
