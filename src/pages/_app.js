import '@/i18n';
import { LanguageProvider } from "@/context/LanguageContext";
import "@/styles/globals.css";
import Script from "next/script";

export default function App({ Component, pageProps }) {
  return (
    <LanguageProvider>
      {/* Google Maps Script */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="beforeInteractive"
      />
      
      {/* App Component */}
      <Component {...pageProps} />
    </LanguageProvider>
  );
}