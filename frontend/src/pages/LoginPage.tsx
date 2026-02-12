import { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Mail, Lock, Loader2, ArrowRight, User } from 'lucide-react';
import { toast } from 'sonner';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login, loginStatus } = useInternetIdentity();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isAdminLoggingIn, setIsAdminLoggingIn] = useState(false);

    const handleAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAdminLoggingIn(true);

        // Admin login logic calling the Express backend
        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                localStorage.setItem('admin_token', data.token);
                localStorage.setItem('user_role', 'admin');
                toast.success('Admin login successful');
                navigate({ to: '/admin' });
            } else {
                toast.error(data.message || 'Invalid admin credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Could not connect to the server');
        } finally {
            setIsAdminLoggingIn(false);
        }
    };

    const handleStudentLogin = async () => {
        try {
            await login();
            toast.success('Logged in successfully');
            navigate({ to: '/student' });
        } catch (error) {
            console.error('II Login error:', error);
            toast.error('Internet Identity login failed');
        }
    };

    return (
        <div className="container relative min-h-[calc(100vh-4rem)] flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-emerald-900" />
                <div className="relative z-20 flex items-center text-lg font-medium">
                    <Shield className="mr-2 h-6 w-6" />
                    CertifyChain
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            "The most secure way to issue and verify academic credentials. Blockchain technology ensures that every certificate is authentic and tamper-proof."
                        </p>
                        <footer className="text-sm">John Doe, Dean of Engineering</footer>
                    </blockquote>
                </div>
            </div>
            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Welcome back
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Choose your login method to continue
                        </p>
                    </div>

                    <Tabs defaultValue="admin" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="admin" className="gap-2">
                                <Shield className="h-4 w-4" />
                                Admin
                            </TabsTrigger>
                            <TabsTrigger value="student" className="gap-2">
                                <User className="h-4 w-4" />
                                Student
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="admin">
                            <Card className="border-emerald-100/50 shadow-lg">
                                <CardHeader>
                                    <CardTitle>Admin Login</CardTitle>
                                    <CardDescription>
                                        Access the administrative portal with your email
                                    </CardDescription>
                                </CardHeader>
                                <form onSubmit={handleAdminLogin}>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="admin@certify.com"
                                                    className="pl-10"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="password">Password</Label>
                                                <Button variant="link" className="px-0 font-normal text-xs" type="button">
                                                    Forgot password?
                                                </Button>
                                            </div>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    className="pl-10"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700" type="submit" disabled={isAdminLoggingIn}>
                                            {isAdminLoggingIn ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Verifying...
                                                </>
                                            ) : (
                                                <>
                                                    Sign In <ArrowRight className="ml-2 h-4 w-4" />
                                                </>
                                            )}
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        </TabsContent>

                        <TabsContent value="student">
                            <Card className="border-emerald-100/50 shadow-lg">
                                <CardHeader>
                                    <CardTitle>Student Access</CardTitle>
                                    <CardDescription>
                                        Securely view your certificates using Internet Identity
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center justify-center py-6 space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                                        <Shield className="h-8 w-8 text-emerald-600" />
                                    </div>
                                    <p className="text-sm text-center text-muted-foreground">
                                        Internet Identity is a secure way to sign in without passwords.
                                    </p>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        variant="outline"
                                        className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                                        onClick={handleStudentLogin}
                                        disabled={loginStatus === 'logging-in'}
                                    >
                                        {loginStatus === 'logging-in' ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Connecting...
                                            </>
                                        ) : (
                                            'Connect with Internet Identity'
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    <p className="px-8 text-center text-sm text-muted-foreground">
                        By clicking continue, you agree to our{' '}
                        <Link to="/" className="underline underline-offset-4 hover:text-primary">
                            Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link to="/" className="underline underline-offset-4 hover:text-primary">
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}
