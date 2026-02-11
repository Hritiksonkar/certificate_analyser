import { useState, useEffect } from 'react';
import { useSearch } from '@tanstack/react-router';
import { useGetCertificateById } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, Search, ShieldCheck } from 'lucide-react';
import VerificationStatus from '../components/VerificationStatus';
import { computeCertificateHash, getCanonicalRules } from '../lib/hash';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function VerifyCertificate() {
  const search = useSearch({ from: '/verify' });
  const certIdFromUrl = (search as any)?.certId || '';

  const [certificateId, setCertificateId] = useState(certIdFromUrl);
  const [activeCertId, setActiveCertId] = useState<bigint | null>(
    certIdFromUrl ? BigInt(certIdFromUrl) : null
  );

  // Optional fields for hash verification
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [degree, setDegree] = useState('');
  const [year, setYear] = useState('');
  const [computedHash, setComputedHash] = useState<string | null>(null);

  const { data: certificate, isLoading, error } = useGetCertificateById(activeCertId);

  useEffect(() => {
    if (certIdFromUrl && !activeCertId) {
      setActiveCertId(BigInt(certIdFromUrl));
    }
  }, [certIdFromUrl, activeCertId]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (certificateId.trim()) {
      try {
        setActiveCertId(BigInt(certificateId.trim()));
        setComputedHash(null);
      } catch {
        setActiveCertId(null);
      }
    }
  };

  const handleComputeHash = async () => {
    if (!studentName.trim() || !studentId.trim() || !degree.trim() || !year) {
      return;
    }

    const yearNum = parseInt(year);
    if (isNaN(yearNum)) return;

    const hash = await computeCertificateHash(studentName, studentId, degree, yearNum);
    setComputedHash(hash);
  };

  const getVerificationStatus = (): 'valid' | 'invalid' | 'not-found' => {
    if (!certificate) return 'not-found';
    if (computedHash && computedHash !== certificate.hash) return 'invalid';
    return 'valid';
  };

  const issuedDate = certificate ? new Date(Number(certificate.issuedAt) / 1_000_000) : null;

  return (
    <div className="container py-12 space-y-8">
      <div className="space-y-2 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 mb-4">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold">Verify Certificate</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Enter a certificate ID to verify its authenticity on the blockchain
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Certificate Verification</CardTitle>
            <CardDescription>
              Enter the certificate ID from the QR code or certificate document
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="certificateId">Certificate ID</Label>
                <Input
                  id="certificateId"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  placeholder="Enter certificate ID"
                  required
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="gap-2">
                  <Search className="h-4 w-4" />
                  Verify
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && activeCertId !== null && (
          <>
            <VerificationStatus status={getVerificationStatus()} />

            {certificate && (
              <Card>
                <CardHeader>
                  <CardTitle>Certificate Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Student Name</p>
                      <p className="font-semibold">{certificate.studentName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Student ID</p>
                      <p className="font-semibold">{certificate.studentId}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Degree</p>
                      <p className="font-semibold">{certificate.degree}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Year</p>
                      <p className="font-semibold">{certificate.year.toString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Issued Date</p>
                      <p className="font-semibold">{issuedDate?.toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Certificate ID</p>
                      <p className="font-semibold">{certificate.id.toString()}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Certificate Hash</p>
                    <code className="block px-3 py-2 bg-muted rounded text-xs break-all">
                      {certificate.hash}
                    </code>
                  </div>

                  <Accordion type="single" collapsible>
                    <AccordionItem value="advanced">
                      <AccordionTrigger>Advanced: Verify Hash Manually</AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Enter the certificate details to compute the hash and compare it with the stored hash.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="verifyName">Student Name</Label>
                            <Input
                              id="verifyName"
                              value={studentName}
                              onChange={(e) => setStudentName(e.target.value)}
                              placeholder="Enter student name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="verifyStudentId">Student ID</Label>
                            <Input
                              id="verifyStudentId"
                              value={studentId}
                              onChange={(e) => setStudentId(e.target.value)}
                              placeholder="Enter student ID"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="verifyDegree">Degree</Label>
                            <Input
                              id="verifyDegree"
                              value={degree}
                              onChange={(e) => setDegree(e.target.value)}
                              placeholder="Enter degree"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="verifyYear">Year</Label>
                            <Input
                              id="verifyYear"
                              type="number"
                              value={year}
                              onChange={(e) => setYear(e.target.value)}
                              placeholder="Enter year"
                            />
                          </div>
                        </div>

                        <Button onClick={handleComputeHash} variant="outline" className="w-full">
                          Compute Hash
                        </Button>

                        {computedHash && (
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Computed Hash</p>
                            <code className="block px-3 py-2 bg-muted rounded text-xs break-all">
                              {computedHash}
                            </code>
                            {computedHash === certificate.hash ? (
                              <p className="text-sm text-emerald-600 font-semibold">
                                ✓ Hash matches! Certificate is valid.
                              </p>
                            ) : (
                              <p className="text-sm text-destructive font-semibold">
                                ✗ Hash does not match. Certificate may be invalid.
                              </p>
                            )}
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground space-y-1">
                          <p className="font-semibold">Hash Canonicalization Rules:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {getCanonicalRules().map((rule, i) => (
                              <li key={i}>{rule}</li>
                            ))}
                          </ul>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
