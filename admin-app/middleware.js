import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
    // A list of all locales that are supported
    locales: ['en', 'es'],

    // Used when no locale matches
    defaultLocale: 'en'
});

export const config = {
    // Match only internationalized pathnames
    // Skip all internal Next.js paths and static files
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
