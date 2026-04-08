import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Goals from "./pages/Goals";
import Profile from "./pages/Profile";
import SpendingDetective from "./pages/SpendingDetective";
import SavingPlan from "./pages/SavingPlan";
import Subscriptions from "./pages/Subscriptions";
import Streaks from "./pages/Streaks";
import MoneyCoach from "./pages/MoneyCoach";
import LifestyleSimulator from "./pages/LifestyleSimulator";
import AchievementReport from "./pages/AchievementReport";
import PeerComparison from "./pages/PeerComparison";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
              <Route path="/budgets" element={<ProtectedRoute><Budgets /></ProtectedRoute>} />
              <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
              <Route path="/detective" element={<ProtectedRoute><SpendingDetective /></ProtectedRoute>} />
              <Route path="/saving-plan" element={<ProtectedRoute><SavingPlan /></ProtectedRoute>} />
              <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
              <Route path="/streaks" element={<ProtectedRoute><Streaks /></ProtectedRoute>} />
              <Route path="/money-coach" element={<ProtectedRoute><MoneyCoach /></ProtectedRoute>} />
              <Route path="/lifestyle" element={<ProtectedRoute><LifestyleSimulator /></ProtectedRoute>} />
              <Route path="/achievements" element={<ProtectedRoute><AchievementReport /></ProtectedRoute>} />
              <Route path="/peers" element={<ProtectedRoute><PeerComparison /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
