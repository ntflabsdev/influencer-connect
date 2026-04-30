import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // Supported locales
  locales: ['en', 'es'],

  // Default locale — used when no locale matches
  defaultLocale: 'en',

  // Only add locale prefix when it's not the default locale
  // This allows /auth/business to work without /en/auth/business
  localePrefix: 'as-needed'
});

export const config = {
  // Match all routes except Next.js internals and static files
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
