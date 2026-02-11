import { useEffect, useMemo, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserRole, useInitializeAccessControl } from '../hooks/useQueries';
import { getSecretParameter } from '../utils/urlParams';

function getErrorMessage(error: unknown): string {
    if (!error) return '';
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    return String(error);
}

export default function AccessControlSetupDialog() {
    const { identity } = useInternetIdentity();
    const isAuthenticated = !!identity;

    const roleQuery = useGetCallerUserRole();
    const initAccess = useInitializeAccessControl();

    const roleError = useMemo(() => getErrorMessage(roleQuery.error), [roleQuery.error]);
    const needsSetup = isAuthenticated && roleQuery.isError;

    const [secret, setSecret] = useState('');

    useEffect(() => {
        if (!needsSetup) return;
        const fromUrl = getSecretParameter('caffeineAdminToken') ?? '';
        setSecret((existing) => existing || fromUrl);
    }, [needsSetup]);

    const tokenEnvMissing = roleError.includes('CAFFEINE_ADMIN_TOKEN environment variable is not set');
    const userNotRegistered = roleError.includes('User is not registered');

    const description = tokenEnvMissing
        ? 'The backend canister is missing CAFFEINE_ADMIN_TOKEN, so it cannot register users yet.'
        : 'Register your principal with the backend. If you are setting up the first admin, enter the admin token. Otherwise, leave it blank to continue as a regular user.';

    const handleInitialize = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await initAccess.mutateAsync(secret.trim());
            toast.success('Access initialized successfully');
        } catch (error) {
            console.error('Initialize access error:', error);
            toast.error(getErrorMessage(error) || 'Failed to initialize access');
        }
    };

    return (
        <Dialog open={needsSetup}>
            <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-emerald-600" />
                        Access setup
                    </DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                {(userNotRegistered || tokenEnvMissing) && roleError ? (
                    <Alert variant={tokenEnvMissing ? 'destructive' : 'default'}>
                        <AlertDescription>{roleError}</AlertDescription>
                    </Alert>
                ) : null}

                <form onSubmit={handleInitialize} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="adminToken">Admin token (optional)</Label>
                        <Input
                            id="adminToken"
                            value={secret}
                            onChange={(e) => setSecret(e.target.value)}
                            placeholder="Paste token, or leave blank"
                            disabled={tokenEnvMissing}
                            autoComplete="off"
                        />
                        <p className="text-xs text-muted-foreground">
                            Tip: you can pass it once via URL hash as <span className="font-mono">#caffeineAdminToken=...</span>
                        </p>
                    </div>

                    <Button type="submit" className="w-full" disabled={tokenEnvMissing || initAccess.isPending}>
                        {initAccess.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Initializing...
                            </>
                        ) : (
                            'Initialize access'
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
