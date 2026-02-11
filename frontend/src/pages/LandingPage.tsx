import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, CheckCircle, Lock, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="container py-12 space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 mb-4">
          <Shield className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Blockchain-Based Academic
          <br />
          <span className="text-emerald-600">Certificate Verification</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Secure, immutable, and instant verification of academic credentials using blockchain technology.
          Eliminate fraud and build trust in the academic system.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link to="/admin">
            <Button size="lg" className="gap-2">
              <Shield className="h-5 w-5" />
              Admin Portal
            </Button>
          </Link>
          <Link to="/student">
            <Button size="lg" variant="outline" className="gap-2">
              View Certificates
            </Button>
          </Link>
          <Link to="/verify">
            <Button size="lg" variant="secondary" className="gap-2">
              Verify Certificate
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <Lock className="h-8 w-8 text-emerald-600 mb-2" />
            <CardTitle>Tamper-Proof</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Certificates stored on blockchain cannot be altered or forged, ensuring authenticity.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Zap className="h-8 w-8 text-emerald-600 mb-2" />
            <CardTitle>Instant Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Employers can verify certificates in seconds by scanning a QR code or entering an ID.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CheckCircle className="h-8 w-8 text-emerald-600 mb-2" />
            <CardTitle>Transparent</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              All certificate records are immutable and verifiable, creating a transparent trust system.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Shield className="h-8 w-8 text-emerald-600 mb-2" />
            <CardTitle>Decentralized</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              No single point of failure. Certificates are stored on a decentralized blockchain network.
            </CardDescription>
          </CardContent>
        </Card>
      </section>

      {/* How It Works */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A simple, secure process for issuing and verifying academic certificates
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-600 font-bold text-xl">
              1
            </div>
            <h3 className="text-xl font-semibold">University Issues Certificate</h3>
            <p className="text-muted-foreground">
              Admin logs in and enters student details. The system generates a unique hash and stores it on the blockchain.
            </p>
          </div>

          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-600 font-bold text-xl">
              2
            </div>
            <h3 className="text-xl font-semibold">Student Receives QR Code</h3>
            <p className="text-muted-foreground">
              A QR code is generated containing the certificate ID and verification URL for easy sharing.
            </p>
          </div>

          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-600 font-bold text-xl">
              3
            </div>
            <h3 className="text-xl font-semibold">Employer Verifies</h3>
            <p className="text-muted-foreground">
              Scan the QR code or enter the certificate ID to instantly verify authenticity against blockchain records.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-12 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-emerald-100 mb-8 max-w-2xl mx-auto">
          Join the future of academic credential verification. Secure, transparent, and instant.
        </p>
        <Link to="/admin">
          <Button size="lg" variant="secondary" className="gap-2">
            <Shield className="h-5 w-5" />
            Access Admin Portal
          </Button>
        </Link>
      </section>
    </div>
  );
}
