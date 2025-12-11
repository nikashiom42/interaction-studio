import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import CarList from "./pages/CarList";
import CarDetail from "./pages/CarDetail";
import TripDetail from "./pages/TripDetail";
import Checkout from "./pages/Checkout";
import BookingSuccess from "./pages/BookingSuccess";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AdminLogin from "./pages/AdminLogin";
import { AdminLayout } from "./components/admin/AdminLayout";
import DashboardContent from "./pages/admin/DashboardContent";
import CarsManagement from "./pages/admin/CarsManagement";
import BookingsManagement from "./pages/admin/BookingsManagement";
import ToursManagement from "./pages/admin/ToursManagement";
import UsersManagement from "./pages/admin/UsersManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/cars" element={<CarList />} />
            <Route path="/car/:id" element={<CarDetail />} />
            <Route path="/trip/:id" element={<TripDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/booking-success" element={<BookingSuccess />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            
            {/* Admin Routes with Sidebar Layout */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<DashboardContent />} />
              <Route path="cars" element={<CarsManagement />} />
              <Route path="bookings" element={<BookingsManagement />} />
              <Route path="users" element={<UsersManagement />} />
              <Route path="tours" element={<ToursManagement />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
