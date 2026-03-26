import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserDataProvider } from "@/context/UserDataContext";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Onboarding from "./pages/Onboarding";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import FirePlanner from "./pages/FirePlanner";
import TaxPlanner from "./pages/TaxPlanner";
import GoalPlanner from "./pages/GoalPlanner";
import WhatIfSimulator from "./pages/WhatIfSimulator";
import MoneyPersonality from "./pages/MoneyPersonality";
import EmergencyFund from "./pages/EmergencyFund";
import AiChat from "./pages/AiChat";
import Settings from "./pages/Settings";
import Guide from "./pages/Guide";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <UserDataProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/fire" element={<ProtectedRoute><FirePlanner /></ProtectedRoute>} />
              <Route path="/tax" element={<ProtectedRoute><TaxPlanner /></ProtectedRoute>} />
              <Route path="/goals" element={<ProtectedRoute><GoalPlanner /></ProtectedRoute>} />
              <Route path="/simulator" element={<ProtectedRoute><WhatIfSimulator /></ProtectedRoute>} />
              <Route path="/personality" element={<ProtectedRoute><MoneyPersonality /></ProtectedRoute>} />
              <Route path="/emergency" element={<ProtectedRoute><EmergencyFund /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><AiChat /></ProtectedRoute>} />
              <Route path="/guide" element={<ProtectedRoute><Guide /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </UserDataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
