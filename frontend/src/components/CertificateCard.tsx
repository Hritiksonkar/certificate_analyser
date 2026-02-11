import { Certificate } from '../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, GraduationCap, Hash, User } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

interface CertificateCardProps {
  certificate: Certificate;
}

export default function CertificateCard({ certificate }: CertificateCardProps) {
  const issuedDate = new Date(Number(certificate.issuedAt) / 1_000_000);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{certificate.degree}</CardTitle>
          <Badge variant="outline" className="text-xs">
            ID: {certificate.id.toString()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{certificate.studentName}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Hash className="h-4 w-4" />
            <span className="truncate">Student ID: {certificate.studentId}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <GraduationCap className="h-4 w-4" />
            <span>Year: {certificate.year.toString()}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Issued: {issuedDate.toLocaleDateString()}</span>
          </div>
        </div>

        <Link
          to="/certificate/$certificateId"
          params={{ certificateId: certificate.id.toString() }}
        >
          <Button variant="outline" size="sm" className="w-full mt-2">
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
