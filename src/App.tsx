import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import React, { Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthCallback from "./pages/auth/AuthCallback";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Create the QueryClient outside the component
const queryClient = new QueryClient();

// Lazy load the Profile component
const Profile = React.lazy(() => import("./pages/Profile"));
// Lazy load the Discover component
const Discover = React.lazy(() => import("./pages/discover"));

const App = () => {
  return (
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth/sign-in" element={<SignIn />} />
                  <Route path="/auth/sign-up" element={<SignUp />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route
                    path="/profile"
                    element={
                      <Suspense
                        fallback={
                          <div className="flex items-center justify-center min-h-screen">
                            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                          </div>
                        }
                      >
                        <Profile />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/discover"
                    element={
                      <Suspense
                        fallback={
                          <div className="flex items-center justify-center min-h-screen">
                            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                          </div>
                        }
                      >
                        <Discover />
                      </Suspense>
                    }
                  />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AnimatePresence>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
