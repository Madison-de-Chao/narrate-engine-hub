import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [".manus.computer"],
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-popover', '@radix-ui/react-tooltip', '@radix-ui/react-tabs'],
          'vendor-charts': ['recharts'],
          'vendor-pdf': ['jspdf', 'html2canvas', 'docx', 'file-saver'],
          'bazi-engine': ['./src/lib/bazi/engine.ts', './src/lib/baziCalculator.ts', './src/lib/shenshaCalculator.ts', './src/lib/tenGodsCalculator.ts'],
        },
      },
    },
  },
}));
