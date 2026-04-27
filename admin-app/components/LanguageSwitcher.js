'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useTransition } from 'react';

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const onSelectChange = (e) => {
        const nextLocale = e.target.value;
        startTransition(() => {
            // Basic substitution for now. 
            // Ideally should use next-intl navigation/Link to handle this robustly.
            // But assuming middleware redirects /... to /en/... or /es/...
            const segments = pathname.split('/');
            // If segments[1] is the locale (e.g. ['','en','dashboard'])
            if (['en', 'es'].includes(segments[1])) {
                segments[1] = nextLocale;
            } else {
                // If no locale in path (rewrite), we might need to prepend.
                // But with middleware "matcher", path usually contains locale in browser bar.
                // If not, we just push the new locale.
                segments.splice(1, 0, nextLocale);
            }
            const newPath = segments.join('/');
            router.replace(newPath);
        });
    };

    return (
        <select
            defaultValue={locale}
            onChange={onSelectChange}
            disabled={isPending}
            className="bg-white/10 text-white border border-white/20 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 hover:bg-white/20 transition-all cursor-pointer backdrop-blur-sm"
        >
            <option value="en" className="bg-gray-900">English</option>
            <option value="es" className="bg-gray-900">Español</option>
        </select>
    );
}
