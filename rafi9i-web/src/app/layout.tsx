import type { Metadata } from "next";
import { Figtree, Geist_Mono, Noto_Sans, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { OG_DEFAULT_IMAGE, SITE_NAME, SITE_URL } from "@/lib/constants";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";

/* Typography (UI/UX skill "clean, accessible, professional" pairing):
   Figtree for headings, Noto Sans for body text, and its sister family
   Noto Sans Arabic so Arabic and Darija read as one consistent system. */
const notoSans = Noto_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const figtree = Figtree({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Orientation & Carrières IA pour le Maroc`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "Plateforme intelligente d'orientation académique, de développement des soft skills et de trajectoire de carrière pour les lycéens et étudiants au Maroc.",
  keywords: [
    "orientation",
    "orientation scolaire Maroc",
    "baccalauréat",
    "études supérieures",
    "soft skills",
    "choix de filière",
    "Rafi9i",
    "écoles d'ingénieurs Maroc",
  ],
  authors: [{ name: "Rafi9i" }],
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: `${SITE_NAME} — Orientation & Carrières IA pour le Maroc`,
    description:
      "Évaluation intelligente d'orientation, plan d'excellence soft skills et trajectoire sur mesure pour les étudiants au Maroc.",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "fr_MA",
    type: "website",
    images: [{ url: OG_DEFAULT_IMAGE, width: 1200, height: 630, alt: "Rafi9i — orientation intelligente au Maroc" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Orientation & Carrières IA pour le Maroc`,
    description:
      "Évaluation intelligente d'orientation, plan d'excellence soft skills et trajectoire sur mesure pour les étudiants au Maroc.",
    images: [OG_DEFAULT_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("rafi_theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark")}else{document.documentElement.classList.remove("dark")}var l=localStorage.getItem("rafi_locale");if(l==="ar"||l==="ary"){document.documentElement.lang=l==="ary"?"ar-MA":"ar";document.documentElement.dir="rtl";document.documentElement.classList.add("font-arabic")}else if(l==="en"||l==="fr"){document.documentElement.lang=l;document.documentElement.dir="ltr";document.documentElement.classList.remove("font-arabic")}}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${notoSans.variable} ${figtree.variable} ${geistMono.variable} ${notoSansArabic.variable} font-sans antialiased bg-background text-foreground selection:bg-orange-500/20 selection:text-orange-950`}
      >
        <ThemeProvider>
          <I18nProvider>
            {children}
            <Toaster />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
