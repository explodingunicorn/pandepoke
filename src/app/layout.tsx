import "@/app/globals.css";
import { Provider } from "@/components/ui/provider"
import Link from "next/link";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>PandePoke Rankings</title>
        <meta name="description" content="Track weekly Pokemon tournament rankings and player results." />
      </head>
      <body style={{ background: '#fff', minHeight: '100vh' }}>
        <Provider>
          <header style={{ width: '100%', background: '#fff', boxShadow: '0 2px 8px #f0f1f2', padding: '1rem 0', marginBottom: '2rem' }}>
            <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#222' }}>PandePoke Rankings</Link>
            </div>
          </header>
          {children}
        </Provider>
      </body>
    </html>
  );
}
