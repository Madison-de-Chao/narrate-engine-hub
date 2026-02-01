import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { MuseumLayout } from "@/components/MuseumLayout";
import { EntitlementGuard } from "@/components/EntitlementGuard";
import { MemberProvider } from "@/lib/member";
import { supabase } from "@/integrations/supabase/client";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import "@/lib/member/styles.css";
import Home from "./pages/Home";
import BaziAnalysis from "./pages/Index";
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
import VersionInfo from "./pages/VersionInfo";
import ResearchReport from "./pages/ResearchReport";
import CharacterGallery from "./pages/CharacterGallery";
import Account from "./pages/Account";
import ReportPrint from "./pages/ReportPrint";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
const queryClient = new QueryClient();

const App = () => (
<QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <MemberProvider supabaseClient={supabase}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <MuseumLayout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/bazi" element={<BaziAnalysis />} />
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
                <Route path="/version" element={<VersionInfo />} />
                <Route path="/research" element={<ResearchReport />} />
                <Route path="/gallery" element={<CharacterGallery />} />
                <Route path="/account" element={<Account />} />
                <Route path="/report/print" element={<ReportPrint />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/about" element={<About />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MuseumLayout>
          </BrowserRouter>
          <SpeedInsights />
          <Analytics />
        </TooltipProvider>
      </MemberProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
