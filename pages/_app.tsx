import { ClerkProvider } from '@clerk/nextjs';
import type { AppProps } from 'next/app';

import '../styles/globals.css';

export default function MyApp({
    Component,
    pageProps
}: AppProps) {
    return (
        <ClerkProvider
            {...pageProps}
            appearance={{
                variables: {
                    colorPrimary: '#e5e5e5',
                    colorPrimaryForeground: '#101010',
                    colorBackground: '#171717',
                    colorForeground: '#f5f5f5',
                    colorInput: '#222222',
                    colorInputForeground: '#f5f5f5',
                    colorMutedForeground: '#a3a3a3',
                    colorNeutral: '#d4d4d4',
                    borderRadius: '10px',
                    fontFamily: 'Inter, Segoe UI, sans-serif'
                }
            }}
        >
            <Component {...pageProps} />
        </ClerkProvider>
    );
}