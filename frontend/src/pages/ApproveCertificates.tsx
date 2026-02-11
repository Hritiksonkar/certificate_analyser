import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type PendingCertificate = {
    _id: string;
    fileUrl?: string;
    status: 'pending' | 'approved';
    createdAt?: string;
};

export default function ApproveCertificates() {
    const [items, setItems] = useState<PendingCertificate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [approvingId, setApprovingId] = useState<string | null>(null);

    const pendingCount = useMemo(() => items.filter((x) => x.status === 'pending').length, [items]);

    async function load() {
        try {
            setIsLoading(true);
            const res = await axios.get<PendingCertificate[]>('/api/admin/pending');
            setItems(res.data);
        } catch (err: any) {
            console.error('Pending load error:', err);
            toast.error(err?.response?.data?.message || 'Failed to load pending approvals');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function approve(id: string) {
        try {
            setApprovingId(id);
            await axios.put(`/api/admin/approve/${id}`);
            toast.success('Approved Successfully');
            await load();
        } catch (err: any) {
            console.error('Approve error:', err);
            toast.error(err?.response?.data?.message || 'Approve failed');
        } finally {
            setApprovingId(null);
        }
    }

    return (
        <div className="container py-12 space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Approve Certificates</h1>
                <p className="text-muted-foreground">Pending approvals: {pendingCount}</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Pending Certificates</CardTitle>
                    <CardDescription>Review uploads and approve them</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {isLoading ? (
                        <p className="text-muted-foreground">Loading…</p>
                    ) : items.length === 0 ? (
                        <p className="text-muted-foreground">No pending certificates.</p>
                    ) : (
                        <div className="space-y-3">
                            {items.map((c) => (
                                <div key={c._id} className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
                                    <div className="min-w-0">
                                        <div className="font-medium truncate">Certificate: {c._id}</div>
                                        <div className="text-sm text-muted-foreground truncate">
                                            File: {c.fileUrl || 'uploaded-file-url'}
                                        </div>
                                    </div>
                                    <Button onClick={() => approve(c._id)} disabled={approvingId === c._id}>
                                        {approvingId === c._id ? 'Approving…' : 'Approve'}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
