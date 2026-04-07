import { useState } from 'react';
import { motion } from 'framer-motion';
import { UtensilsCrossed, Plus, Edit2, ShieldAlert, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';

export default function MessPage() {
  const { user } = useAppStore();
  const isMessStaff = user?.role === 'mess' || user?.role === 'admin';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold">Mess Menu</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Weekly food schedule & feedback</p>
        </div>
        {isMessStaff && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-[10px] font-bold uppercase tracking-wider">
            <ShieldAlert className="h-3 w-3" />
            Mess Management
          </div>
        )}
      </div>

      <div className="grid gap-6">
        <Card>
          <CardContent className="p-10 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <UtensilsCrossed className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-lg font-semibold">Menu System Migrating</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
              We are currently migrating the live menu database. 
              {isMessStaff ? " As a Mess Staff member, you will soon be able to edit meals here directly." : " Check back soon for the updated weekly schedule."}
            </p>
            {isMessStaff && (
              <Button className="mt-6 gap-2 rounded-full shadow-lg hover:shadow-success/20">
                <Plus className="h-4 w-4" /> Initialize Weekly Menu
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
