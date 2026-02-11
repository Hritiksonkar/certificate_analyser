import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useGetCertificatesByStudentId } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, GraduationCap } from 'lucide-react';
import CertificateCard from '../components/CertificateCard';

export default function StudentDashboard() {
  const { isAuthenticated, userProfile, isLoading: userLoading } = useCurrentUser();
  const [searchStudentId, setSearchStudentId] = useState('');
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);

  const { data: certificates, isLoading: certsLoading, error } = useGetCertificatesByStudentId(activeStudentId);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchStudentId.trim()) {
      setActiveStudentId(searchStudentId.trim());
    }
  };

  // Auto-populate from profile if available
  const prefillStudentId = userProfile?.studentId || '';

  if (userLoading) {
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
          <GraduationCap className="h-4 w-4" />
          <AlertDescription>
            Please log in to view your certificates.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-12 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-emerald-600" />
          Student Dashboard
        </h1>
        <p className="text-muted-foreground">
          View and manage your academic certificates
        </p>
      </div>

      <div>
        <Button asChild>
          <Link to="/student/upload">Upload Certificate</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Certificates</CardTitle>
          <CardDescription>
            Enter your Student ID to view your certificates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input
                id="studentId"
                value={searchStudentId}
                onChange={(e) => setSearchStudentId(e.target.value)}
                placeholder={prefillStudentId || 'Enter your student ID'}
                required
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="gap-2">
                <Search className="h-4 w-4" />
                Search
              </Button>
            </div>
          </form>

          {prefillStudentId && !activeStudentId && (
            <Button
              variant="link"
              onClick={() => {
                setSearchStudentId(prefillStudentId);
                setActiveStudentId(prefillStudentId);
              }}
              className="mt-2"
            >
              Use my Student ID: {prefillStudentId}
            </Button>
          )}
        </CardContent>
      </Card>

      {activeStudentId && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Certificates for Student ID: {activeStudentId}
          </h2>

          {certsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>
                {error.message || 'Failed to load certificates. Please try again.'}
              </AlertDescription>
            </Alert>
          ) : certificates && certificates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {certificates.map((cert) => (
                <CertificateCard key={cert.id.toString()} certificate={cert} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No certificates found for this Student ID.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
