import { useState } from 'react';
import { useGetCertificateHistory } from '../hooks/useQueries';
import CertificateCard from './CertificateCard';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function IssuanceHistory() {
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 10;

  const { data: history, isLoading, error } = useGetCertificateHistory(pageIndex, pageSize);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load certificate history. {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!history || history.certificates.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No certificates issued yet.
      </div>
    );
  }

  const totalPages = Math.ceil(Number(history.totalCertificates) / pageSize);
  const hasNextPage = pageIndex < totalPages - 1;
  const hasPrevPage = pageIndex > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Total certificates: {history.totalCertificates.toString()}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex((p) => p - 1)}
            disabled={!hasPrevPage}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pageIndex + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex((p) => p + 1)}
            disabled={!hasNextPage}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {history.certificates.map((cert) => (
          <CertificateCard key={cert.id.toString()} certificate={cert} />
        ))}
      </div>
    </div>
  );
}
