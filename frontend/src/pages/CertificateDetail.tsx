import { useParams, Link } from '@tanstack/react-router';
import { useGetCertificateById } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Copy, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { buildVerificationUrl } from '../lib/certificateLinks';
import { QRCode } from '../lib/qrCode';
import { toast } from 'sonner';

export default function CertificateDetail() {
  const { certificateId } = useParams({ from: '/certificate/$certificateId' });
  const certId = certificateId ? BigInt(certificateId) : null;

  const { data: certificate, isLoading, error } = useGetCertificateById(certId);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  if (isLoading) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="container py-12 space-y-4">
        <Link to="/student">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <Alert variant="destructive">
          <AlertDescription>
            Certificate not found or failed to load.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const issuedDate = new Date(Number(certificate.issuedAt) / 1_000_000);
  const verificationUrl = buildVerificationUrl(certificate.id);

  return (
    <div className="container py-12 space-y-6">
      <Link to="/student">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-2xl">Certificate Details</CardTitle>
                <Badge variant="outline">ID: {certificate.id.toString()}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Student Name</p>
                  <p className="text-lg font-semibold">{certificate.studentName}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Student ID</p>
                  <p className="text-lg font-semibold">{certificate.studentId}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Degree</p>
                  <p className="text-lg font-semibold">{certificate.degree}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Year</p>
                  <p className="text-lg font-semibold">{certificate.year.toString()}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Issued Date</p>
                  <p className="text-lg font-semibold">{issuedDate.toLocaleDateString()}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Issued Time</p>
                  <p className="text-lg font-semibold">{issuedDate.toLocaleTimeString()}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Issuer Principal</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-muted rounded text-xs truncate">
                    {certificate.issuer.toString()}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(certificate.issuer.toString(), 'Issuer')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Certificate Hash (SHA-256)</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-muted rounded text-xs truncate">
                    {certificate.hash}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(certificate.hash, 'Hash')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <QRCode value={verificationUrl} size={200} />
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Verification URL</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-2 py-1 bg-muted rounded text-xs truncate">
                    {verificationUrl}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(verificationUrl, 'URL')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Link to="/verify" search={{ certId: certificate.id.toString() }}>
                <Button variant="default" className="w-full gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Verify Certificate
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-600">
            <CardContent className="pt-6">
              <p className="text-sm text-emerald-900 dark:text-emerald-100">
                This certificate is stored on the blockchain and cannot be altered or forged.
                Anyone can verify its authenticity using the QR code or verification URL.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
