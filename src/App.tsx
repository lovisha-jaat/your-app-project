import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserDataProvider } from "@/context/UserDataContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import FirePlanner from "./pages/FirePlanner";
import TaxPlanner from "./pages/TaxPlanner";
import GoalPlanner from "./pages/GoalPlanner";
import WhatIfSimulator from "./pages/WhatIfSimulator";
import MoneyPersonality from "./pages/MoneyPersonality";
import EmergencyFund from "./pages/EmergencyFund";
import AiChat from "./pages/AiChat";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <UserDataProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/fire" element={<FirePlanner />} />
            <Route path="/tax" element={<TaxPlanner />} />
            <Route path="/goals" element={<GoalPlanner />} />
            <Route path="/simulator" element={<WhatIfSimulator />} />
            <Route path="/personality" element={<MoneyPersonality />} />
            <Route path="/emergency" element={<EmergencyFund />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </UserDataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
