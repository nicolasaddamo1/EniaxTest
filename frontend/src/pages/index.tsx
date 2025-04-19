import { useState } from 'react';
import axios from 'axios';

// Tipos para los datos de usuario
type UserData = {
    id: string;
    name: string;
    email?: string;
};

// Tipo para la respuesta de verificación
type VerifyResponse = {
    user: UserData;
    token_info?: any;
};

export default function Home() {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const checkLoginState = () => {
        window.FB.getLoginStatus(function (response: any) {
            if (response.status === 'connected') {
                getFacebookUserData();
            }
        });
    };

    const handleFacebookLogin = () => {
        setLoading(true);
        window.FB.login(
            (response: any) => {
                if (response.authResponse) {
                    getFacebookUserData();
                } else {
                    setLoading(false);
                }
            },
            { scope: 'public_profile,email' }
        );
    };

    const getFacebookUserData = () => {
        window.FB.api('/me?fields=id,name,email', async (userData: UserData) => {
            try {
                // Envía el token a tu backend para verificación
                const { data } = await axios.post<VerifyResponse>('/api/facebook/verify', {
                    accessToken: window.FB.getAuthResponse().accessToken
                });
                setUser(data.user);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        });
    };

    return (
        <div style={{ padding: '2rem' }}>
            {user ? (
                <div>
                    <h1>Bienvenido, {user.name}!</h1>
                    <p>Email: {user.email || 'No proporcionado'}</p>
                </div>
            ) : (
                <button
                    onClick={handleFacebookLogin}
                    disabled={loading}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#1877f2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '1rem'
                    }}
                >
                    {loading ? 'Cargando...' : 'Iniciar con Facebook'}
                </button>
            )}
        </div>
    );
}