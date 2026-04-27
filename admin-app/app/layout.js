export default function RootLayout({ children }) {
  return (
    <html className="dark" style={{ colorScheme: 'dark' }}>
      <body className="bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}