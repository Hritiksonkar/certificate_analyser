import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface VerificationStatusProps {
  status: 'valid' | 'invalid' | 'not-found';
  message?: string;
}

export default function VerificationStatus({ status, message }: VerificationStatusProps) {
  if (status === 'valid') {
    return (
      <Alert className="border-emerald-600 bg-emerald-50 dark:bg-emerald-950/20">
        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        <AlertTitle className="text-emerald-900 dark:text-emerald-100">
          Certificate Valid
        </AlertTitle>
        <AlertDescription className="text-emerald-800 dark:text-emerald-200">
          {message || 'This certificate is authentic and has been verified on the blockchain.'}
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'invalid') {
    return (
      <Alert variant="destructive">
        <XCircle className="h-5 w-5" />
        <AlertTitle>Certificate Invalid</AlertTitle>
        <AlertDescription>
          {message || 'This certificate could not be verified. It may be fraudulent or tampered with.'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-amber-600 bg-amber-50 dark:bg-amber-950/20">
      <AlertCircle className="h-5 w-5 text-amber-600" />
      <AlertTitle className="text-amber-900 dark:text-amber-100">
        Certificate Not Found
      </AlertTitle>
      <AlertDescription className="text-amber-800 dark:text-amber-200">
        {message || 'No certificate found with the provided ID.'}
      </AlertDescription>
    </Alert>
  );
}
