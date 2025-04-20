'use client';
import { useEffect } from 'react';
import Script from 'next/script';

declare global {
    interface Window {
        FB: {
            init: (params: {
                appId: string;
                cookie: boolean;
                xfbml: boolean;
                version: string;
            }) => void;
            getLoginStatus: (callback: (response: any) => void) => void;
            login: (
                callback: (response: any) => void,
                options: { scope: string }
            ) => void;
            api: (path: string, callback: (response: any) => void) => void;
            getAuthResponse: () => { accessToken: string };
            AppEvents: {
                logPageView: () => void;
            };
        };
        fbAsyncInit: () => void;
    }
}

interface FacebookProviderProps {
    children: React.ReactNode;
}

export function FacebookProvider({ children }: FacebookProviderProps) {
    useEffect(() => {
        window.fbAsyncInit = function () {
            window.FB.init({
                appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '',
                cookie: true,
                xfbml: true,
                version: 'v19.0'
            });

            window.FB.AppEvents.logPageView();
        };
    }, []);

    return (
        <>
            <Script
                strategy="lazyOnload"
                src="https://connect.facebook.net/en_US/sdk.js"
                onLoad={() => console.log('Facebook SDK cargado')}
            />
            {children}
        </>
    );
}