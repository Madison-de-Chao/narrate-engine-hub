import { lazy, Suspense } from "react";
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

// Eager: Home (landing page)
import Home from "./pages/Home";

// Lazy-loaded pages
const BaziAnalysis = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Subscribe = lazy(() => import("./pages/Subscribe"));
const Admin = lazy(() => import("./pages/Admin"));
const BaziTest = lazy(() => import("./pages/BaziTest"));
const ZoneGuide = lazy(() => import("./pages/ZoneGuide"));
const BaziAcademy = lazy(() => import("./pages/BaziAcademy"));
const NavigationMap = lazy(() => import("./pages/NavigationMap"));
const ApiDocs = lazy(() => import("./pages/ApiDocs"));
const ApiConsole = lazy(() => import("./pages/ApiConsole"));
const ExportData = lazy(() => import("./pages/ExportData"));
const PromptTemplates = lazy(() => import("./pages/PromptTemplates"));
const VersionInfo = lazy(() => import("./pages/VersionInfo"));
const ResearchReport = lazy(() => import("./pages/ResearchReport"));
const CharacterGallery = lazy(() => import("./pages/CharacterGallery"));
const Account = lazy(() => import("./pages/Account"));
const ReportPrint = lazy(() => import("./pages/ReportPrint"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const About = lazy(() => import("./pages/About"));
const SystemDocumentation = lazy(() => import("./pages/SystemDocumentation"));
const SystemWhitepaper = lazy(() => import("./pages/SystemWhitepaper"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground">載入中…</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <MemberProvider supabaseClient={supabase}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <MuseumLayout>
              <Suspense fallback={<PageLoader />}>
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
                  <Route path="/docs" element={<SystemDocumentation />} />
                  <Route path="/whitepaper" element={<SystemWhitepaper />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
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
