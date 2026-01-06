import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import WhatsAppButton from "@/components/WhatsAppButton";
import Index from "./pages/Index";
import CarList from "./pages/CarList";
import TourList from "./pages/TourList";
import CarDetail from "./pages/CarDetail";
import TripDetail from "./pages/TripDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import BookingSuccess from "./pages/BookingSuccess";
import Auth from "./pages/Auth";
import UserDashboard from "./pages/UserDashboard";
import AdminLogin from "./pages/AdminLogin";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import BlogDetail from "./pages/BlogDetail";
import { AdminLayout } from "./components/admin/AdminLayout";
import DashboardContent from "./pages/admin/DashboardContent";
import CarsManagement from "./pages/admin/CarsManagement";
import BookingsManagement from "./pages/admin/BookingsManagement";
import ToursManagement from "./pages/admin/ToursManagement";
import UsersManagement from "./pages/admin/UsersManagement";
import FAQsManagement from "./pages/admin/FAQsManagement";
import MessagesManagement from "./pages/admin/MessagesManagement";
import BlogsManagement from "./pages/admin/BlogsManagement";
import LocationsManagement from "./pages/admin/LocationsManagement";
import SettingsManagement from "./pages/admin/SettingsManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/cars" element={<CarList />} />
              <Route path="/tours" element={<TourList />} />
              <Route path="/car/:id" element={<CarDetail />} />
              <Route path="/trip/:id" element={<TripDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/booking-success" element={<BookingSuccess />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/blog/:slug" element={<BlogDetail />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              
              {/* Admin Routes with Sidebar Layout */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<DashboardContent />} />
                <Route path="cars" element={<CarsManagement />} />
                <Route path="bookings" element={<BookingsManagement />} />
                <Route path="users" element={<UsersManagement />} />
                <Route path="tours" element={<ToursManagement />} />
                <Route path="faqs" element={<FAQsManagement />} />
                <Route path="blogs" element={<BlogsManagement />} />
                <Route path="messages" element={<MessagesManagement />} />
                <Route path="locations" element={<LocationsManagement />} />
                <Route path="settings" element={<SettingsManagement />} />
              </Route>
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>

            {/* WhatsApp Floating Button - Available on all pages */}
            <WhatsAppButton />
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
