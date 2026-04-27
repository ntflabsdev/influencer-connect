import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import "../globals.css";
import Providers from '../providers.js';

export const metadata = {
    title: 'Influencer Connect Admin',
    description: 'Admin panel for Influencer Connect',
};

export default async function LocaleLayout({ children, params: { locale } }) {
    const messages = await getMessages();

    return (
        <NextIntlClientProvider messages={messages}>
            <Providers>{children}</Providers>
        </NextIntlClientProvider>
    );
}