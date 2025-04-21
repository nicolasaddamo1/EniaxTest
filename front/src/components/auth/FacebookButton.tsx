'use client';
import { useState, useEffect } from 'react';
import Script from 'next/script';

export function FacebookLoginButton() {
    const [isSdkReady, setIsSdkReady] = useState(false);

    useEffect(() => {
        const checkFB = () => {
            if (window.FB) {
                window.FB.init({
                    appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '',
                    cookie: true,
                    xfbml: true,
                    version: 'v22.0'
                });
                setIsSdkReady(true);
            } else {
                setTimeout(checkFB, 100);
            }
        };

        checkFB();
    }, []);
    const handleLogin = () => {
        if (!isSdkReady || !window.FB) return;

        window.FB.login(
            (response) => {
                if (response.authResponse) {
                    console.log('Login exitoso:', response.authResponse);
                } else {
                    console.log('Usuario canceló el login');
                }
            },
            { scope: 'public_profile,email' }
        );
    };

    return (
        <>
            {/* Carga del SDK */}
            <Script
                strategy="beforeInteractive"
                src="https://connect.facebook.net/en_US/sdk.js"
            />

            {/* Botón */}
            <button
                onClick={handleLogin}
                disabled={!isSdkReady}
                className={`px-4 py-2 rounded-md text-white ${isSdkReady ? 'bg-[#1877F2] hover:bg-[#166FE5]' : 'bg-gray-400'
                    }`}
            >
                {isSdkReady ? 'Continuar con Facebook' : 'Cargando Facebook...'}
            </button>
        </>
    );
}
