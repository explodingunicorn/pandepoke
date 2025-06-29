import "@/app/globals.css";
import { Provider } from "@/components/ui/provider"
import { SubmissionHeader } from "@/components/SubmissionHeader";

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
          <SubmissionHeader />
          {children}
        </Provider>
      </body>
    </html>
  );
}
