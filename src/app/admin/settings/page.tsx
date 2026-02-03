
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

export default function AdminSettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="py-4">
        <div className="mb-4">
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
                Manage your admin dashboard settings.
            </p>
        </div>
        <div className="max-w-2xl">
            <Card>
            <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of the admin dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label htmlFor="theme-switch">Theme</Label>
                        <p className="text-sm text-muted-foreground">
                            Switch between light and dark mode for the dashboard.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Sun className="h-5 w-5" />
                        <Switch
                            id="theme-switch"
                            checked={theme === 'dark'}
                            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                            aria-label="Toggle theme"
                        />
                        <Moon className="h-5 w-5" />
                    </div>
                </div>
            </CardContent>
            </Card>
        </div>
    </div>
  );
}
