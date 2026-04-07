import { motion } from 'framer-motion';
import { Bell, CheckCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function NotificationsPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-0.5">0 unread</p>
        </div>
        <button className="text-xs text-primary font-medium flex items-center gap-1"><CheckCheck className="h-3.5 w-3.5" /> Mark all read</button>
      </div>

      <div className="space-y-2">
        <Card>
          <CardContent className="p-10 flex flex-col items-center justify-center text-center opacity-70">
            <Bell className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="text-sm font-semibold">No new notifications</h3>
            <p className="text-xs text-muted-foreground mt-1">You're all caught up!</p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
