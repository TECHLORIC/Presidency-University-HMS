import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { TopBar } from './TopBar';
import { FloatingAIAssistant } from '../chat/FloatingAIAssistant';

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-6 md:pb-6 relative scroll-smooth">
          {children}
        </main>
      </div>
      <BottomNav />
      {/* Floating Global Chat Widget */}
      <FloatingAIAssistant />
    </div>
  );
}
