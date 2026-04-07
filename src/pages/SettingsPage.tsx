import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Shield, Bell, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-xl font-bold">System Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Global configuration for the HMS system</p>
      </div>

      <div className="grid gap-4">
        {[
          { icon: Shield, label: 'Security', desc: 'Manage RLS policies and auth domains' },
          { icon: Bell, label: 'Notifications', desc: 'Configure global push alert triggers' },
          { icon: Lock, label: 'Privacy', desc: 'Data retention and log access' },
        ].map((item) => (
          <Card key={item.label} className="hover:bg-accent/5 transition-colors cursor-pointer group">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{item.label}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-xs">Configure</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed border-2">
        <CardContent className="p-8 text-center bg-muted/20">
          <SettingsIcon className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-20" />
          <h3 className="text-sm font-medium text-muted-foreground">More settings coming soon</h3>
          <p className="text-xs text-muted-foreground/60 mt-1 italic">Integration with hostel block API is in progress.</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
