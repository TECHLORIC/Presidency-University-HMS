import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAppStore } from "@/lib/store";

import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import LeavePage from "./pages/LeavePage.tsx";
import TicketsPage from "./pages/TicketsPage.tsx";
import MessPage from "./pages/MessPage.tsx";
import AnnouncementsPage from "./pages/AnnouncementsPage.tsx";
import NotificationsPage from "./pages/NotificationsPage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import UsersPage from "./pages/UsersPage.tsx";
import SettingsPage from "./pages/SettingsPage.tsx";
import SecurityPage from "./pages/SecurityPage.tsx";
import { AppLayout } from "./components/layout/AppLayout.tsx";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAppStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <AppLayout>{children}</AppLayout>;
}

function MainApp() {
  const { initializeAuth, isHandlingAuth } = useAppStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (isHandlingAuth) {
    return <div className="min-h-screen flex items-center justify-center bg-muted/40"><p className="text-muted-foreground animate-pulse">Starting session...</p></div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
        <Route path="/leave" element={<ProtectedRoute><LeavePage /></ProtectedRoute>} />
        <Route path="/tickets" element={<ProtectedRoute><TicketsPage /></ProtectedRoute>} />
        <Route path="/mess" element={<ProtectedRoute><MessPage /></ProtectedRoute>} />
        <Route path="/announcements" element={<ProtectedRoute><AnnouncementsPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/security" element={<ProtectedRoute><SecurityPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <MainApp />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
