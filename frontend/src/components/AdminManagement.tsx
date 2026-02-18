import { useState } from 'react';
import { Principal } from '@dfinity/principal';
import { useAssignUserRole } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, UserPlus, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { UserRole } from '../backend';

export default function AdminManagement() {
    const [principalStr, setPrincipalStr] = useState('');
    const [role, setRole] = useState<UserRole>('admin');
    const assignRole = useAssignUserRole();

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!principalStr.trim()) {
            toast.error('Please enter a Principal ID');
            return;
        }

        try {
            const principal = Principal.fromText(principalStr.trim());
            await assignRole.mutateAsync({
                user: principal,
                role,
            });

            toast.success(`Role ${role} assigned to principal successfully`);
            setPrincipalStr('');
        } catch (error: any) {
            console.error('Assign role error:', error);
            toast.error(error.message || 'Failed to assign role. Make sure the Principal ID is valid.');
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-emerald-600" />
                        Assign User Roles
                    </CardTitle>
                    <CardDescription>
                        Grant administrative or student access to other users
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAssign} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="principal">Principal ID (Text format)</Label>
                            <Input
                                id="principal"
                                value={principalStr}
                                onChange={(e) => setPrincipalStr(e.target.value)}
                                placeholder="aaaaa-aa..."
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select
                                value={role}
                                onValueChange={(value) => setRole(value as UserRole)}
                            >
                                <SelectTrigger id="role">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="user">Student / User</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={assignRole.isPending}
                        >
                            {assignRole.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Assigning Role...
                                </>
                            ) : (
                                'Assign Role'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                <CardHeader>
                    <CardTitle className="text-amber-800 dark:text-amber-400 flex items-center gap-2 text-base">
                        <ShieldAlert className="h-5 w-5" />
                        Important Security Note
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-amber-700 dark:text-amber-300">
                    Be careful when assigning administrative roles. Admins can issue certificates, manage other admins, and access all transaction history.
                </CardContent>
            </Card>
        </div>
    );
}
