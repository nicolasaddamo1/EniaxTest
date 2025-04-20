'use client';
import { useState } from 'react';
import axios from 'axios';

type UserData = {
    id: string;
    name: string;
    email?: string;
};

export function FacebookLoginButton() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = () => {
        setLoading(true);
        setError('');

        if (!window.FB) {
            setError('Facebook SDK no está disponible');
            setLoading(false);
            return;
        }

        window.FB.login(
            (response) => {
                if (response.authResponse) {
                    fetchUserData(response.authResponse.accessToken);
                } else {
                    setError('Inicio de sesión cancelado');
                    setLoading(false);
                }
            },
            { scope: 'public_profile,email' }
        );
    };

    const fetchUserData = async (accessToken: string) => {
        try {
            // 1. Verificar token con tu backend
            const { data } = await axios.post('/api/auth/facebook/verify', {
                accessToken
            });

            // 2. Obtener datos básicos del usuario
            window.FB.api('/me?fields=id,name,email', (userData: UserData) => {
                console.log('Datos de usuario:', userData);
                // Aquí puedes manejar los datos del usuario
            });

        } catch (err) {
            setError('Error al autenticar con Facebook');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center">
            <button
                onClick={handleLogin}
                disabled={loading}
                className={`px-4 py-2 rounded-md flex items-center gap-2
          ${loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-[#1877F2] hover:bg-[#166FE5] text-white'
                    }`
                }
            >
                {loading ? (
                    'Cargando...'
                ) : (
                    <>
                        <FacebookIcon />
                        Continuar con Facebook
                    </>
                )}
            </button>
            {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
        </div>
    );
}

function FacebookIcon() {
    return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
        </svg>
    );
}