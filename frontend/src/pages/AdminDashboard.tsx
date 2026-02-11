import { useState } from 'react';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useIssueCertificate } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Shield, CheckCircle, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { computeCertificateHash } from '../lib/hash';
import { buildVerificationUrl } from '../lib/certificateLinks';
import { QRCode } from '../lib/qrCode';
import IssuanceHistory from '../components/IssuanceHistory';
import AdminManagement from '../components/AdminManagement';
import { Certificate } from '../backend';

export default function AdminDashboard() {
  const { isAuthenticated, isAdmin, isLoading } = useCurrentUser();
  const issueCertificate = useIssueCertificate();

  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [degree, setDegree] = useState('');
  const [year, setYear] = useState('');
  const [issuedCertificate, setIssuedCertificate] = useState<Certificate | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentName.trim() || !studentId.trim() || !degree.trim() || !year) {
      toast.error('Please fill in all fields');
      return;
    }

    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
      toast.error('Please enter a valid year');
      return;
    }

    try {
      const hash = await computeCertificateHash(studentName, studentId, degree, yearNum);
      const url = buildVerificationUrl('pending');

      const certificate = await issueCertificate.mutateAsync({
        input: {
          studentName: studentName.trim(),
          studentId: studentId.trim(),
          degree: degree.trim(),
          year: BigInt(yearNum),
        },
        hash,
        url: buildVerificationUrl('pending'),
      });

      setIssuedCertificate(certificate);
      toast.success('Certificate issued successfully!');

      // Reset form
      setStudentName('');
      setStudentId('');
      setDegree('');
      setYear('');
    } catch (error: any) {
      console.error('Issue certificate error:', error);
      toast.error(error.message || 'Failed to issue certificate. Please try again.');
    }
  };

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

  if (!isAuthenticated) {
    return (
      <div className="container py-12">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Please log in to access the admin dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Access denied. Only administrators can issue certificates.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-12 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8 text-emerald-600" />
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Issue and manage academic certificates
        </p>
      </div>

      <Tabs defaultValue="issue" className="space-y-6">
        <TabsList>
          <TabsTrigger value="issue">Issue Certificate</TabsTrigger>
          <TabsTrigger value="history">Issuance History</TabsTrigger>
          <TabsTrigger value="manage">Manage Admins</TabsTrigger>
        </TabsList>

        <TabsContent value="issue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Issue New Certificate</CardTitle>
                <CardDescription>
                  Enter student details to create a new certificate on the blockchain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentName">Student Name *</Label>
                    <Input
                      id="studentName"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID *</Label>
                    <Input
                      id="studentId"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="STU123456"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="degree">Degree *</Label>
                    <Input
                      id="degree"
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      placeholder="Bachelor of Computer Science"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year">Year *</Label>
                    <Input
                      id="year"
                      type="number"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="2024"
                      min="1900"
                      max="2100"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={issueCertificate.isPending}
                  >
                    {issueCertificate.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Issuing Certificate...
                      </>
                    ) : (
                      'Issue Certificate'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {issuedCertificate && (
              <Card className="border-emerald-600">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle className="h-5 w-5" />
                    Certificate Issued Successfully
                  </CardTitle>
                  <CardDescription>
                    Certificate has been recorded on the blockchain
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Certificate ID</Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-muted rounded text-sm">
                        {issuedCertificate.id.toString()}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(issuedCertificate.id.toString(), 'Certificate ID')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Certificate Hash</Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-muted rounded text-xs truncate">
                        {issuedCertificate.hash}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(issuedCertificate.hash, 'Hash')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Verification URL</Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-muted rounded text-xs truncate">
                        {buildVerificationUrl(issuedCertificate.id)}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(buildVerificationUrl(issuedCertificate.id), 'URL')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-center pt-4">
                    <QRCode
                      value={buildVerificationUrl(issuedCertificate.id)}
                      size={200}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Certificate Issuance History</CardTitle>
              <CardDescription>
                View all certificates issued by administrators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IssuanceHistory />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          <AdminManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
