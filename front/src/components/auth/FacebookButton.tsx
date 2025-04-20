'use client';
import { useState, useEffect } from 'react';

export function FacebookLoginButton() {
    const [isSdkReady, setIsSdkReady] = useState(false);

    useEffect(() => {
        if (window.FB) {
            setIsSdkReady(true);
            return;
        }

        window.fbAsyncInit = function () {
            window.FB.init({
                appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '',
                cookie: true,
                xfbml: true,
                version: 'v19.0'
            });
            setIsSdkReady(true);
        };

        // No necesitas cargar el script manualmente si usas el Script de Next.js
    }, []);

    const handleLogin = () => {
        if (!isSdkReady || !window.FB) return;

        window.FB.login(
            (response) => {
                if (response.authResponse) {
                    console.log('Login exitoso:', response.authResponse);
                    // Manejar login exitoso
                } else {
                    console.log('Usuario canceló el login');
                }
            },
            { scope: 'public_profile,email' }
        );
    };

    return (
        <button
            onClick={handleLogin}
            disabled={!isSdkReady}
            className={`px-4 py-2 rounded-md text-white ${isSdkReady ? 'bg-[#1877F2] hover:bg-[#166FE5]' : 'bg-gray-400'
                }`}
        >
            {isSdkReady ? 'Continuar con Facebook' : 'Cargando Facebook...'}
        </button>
    );
}