import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { MuseumLayout } from "@/components/MuseumLayout";
import { EntitlementGuard } from "@/components/EntitlementGuard";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Subscribe from "./pages/Subscribe";
import Admin from "./pages/Admin";
import BaziTest from "./pages/BaziTest";
import ZoneGuide from "./pages/ZoneGuide";
import BaziAcademy from "./pages/BaziAcademy";
import NavigationMap from "./pages/NavigationMap";
import ApiDocs from "./pages/ApiDocs";
import ApiConsole from "./pages/ApiConsole";
import ExportData from "./pages/ExportData";
import PromptTemplates from "./pages/PromptTemplates";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <MuseumLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/subscribe" element={<Subscribe />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/test" element={<BaziTest />} />
              <Route path="/academy" element={
                <EntitlementGuard productId="bazi-premium">
                  <BaziAcademy />
                </EntitlementGuard>
              } />
              <Route path="/guide/:zoneId" element={
                <EntitlementGuard productId="bazi-premium">
                  <ZoneGuide />
                </EntitlementGuard>
              } />
              <Route path="/map" element={<NavigationMap />} />
              <Route path="/api-docs" element={<ApiDocs />} />
              <Route path="/api-console" element={<ApiConsole />} />
              <Route path="/export" element={<ExportData />} />
              <Route path="/prompt-templates" element={<PromptTemplates />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MuseumLayout>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
