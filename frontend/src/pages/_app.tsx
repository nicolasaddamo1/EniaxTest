import { useEffect } from 'react';
import Script from 'next/script';
import { AppProps } from 'next/app';

// Extiende la interfaz Window para incluir FB
declare global {
    interface Window {
        FB: any;
        fbAsyncInit: () => void;
    }
}

function MyApp({ Component, pageProps }: AppProps) {
    useEffect(() => {
        // Función para cargar el SDK de Facebook
        window.fbAsyncInit = function () {
            window.FB.init({
                appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
                cookie: true,
                xfbml: true,
                version: 'v18.0'
            });

            window.FB.AppEvents.logPageView();
        };
    }, []);

    return (
        <>
            <Script
                strategy="lazyOnload"
                src="https://connect.facebook.net/en_US/sdk.js"
                onLoad={() => {
                    console.log('Facebook SDK loaded');
                }}
            />
            <Component {...pageProps} />
        </>
    );
}

export default MyApp;