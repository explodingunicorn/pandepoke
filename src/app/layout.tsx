import "@/app/globals.css";
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
      <body className="bg-white min-h-screen">
        <SubmissionHeader />
        {children}
      </body>
    </html>
  );
}
