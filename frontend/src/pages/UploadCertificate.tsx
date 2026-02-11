import { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function UploadCertificate() {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            toast.error('Please select a file');
            return;
        }

        const formData = new FormData();
        formData.append('certificate', file);

        try {
            setIsUploading(true);
            await axios.post('/api/student/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success('Certificate Uploaded Successfully');
            setFile(null);
        } catch (err: any) {
            console.error('Upload error:', err);
            toast.error(err?.response?.data?.message || 'Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="container py-12">
            <Card>
                <CardHeader>
                    <CardTitle>Upload Certificate</CardTitle>
                    <CardDescription>Upload your academic certificate for admin approval.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpload} className="space-y-4">
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                            className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border file:border-border file:bg-muted file:px-4 file:py-2 file:text-foreground"
                        />
                        <Button type="submit" disabled={isUploading}>
                            {isUploading ? 'Uploading…' : 'Upload'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
