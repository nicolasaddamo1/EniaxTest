// app/components/TwitterIntegration.jsx
'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Trend {
    name: string;
    query: string;
    tweet_volume: number | string;
    url: string;
}

interface Tweet {
    id: string;
    user_screen_name: string;
    created_at: string;
    text: string;
    favorite_count: number;
    retweet_count: number;
}

const TwitterIntegration = () => {
    const [username, setUsername] = useState('');
    const [tweets, setTweets] = useState<Tweet[]>([]);
    const [newTweet, setNewTweet] = useState('');
    const [hashtag, setHashtag] = useState('');
    const [searchResults, setSearchResults] = useState<Tweet[]>([]);
    const [trends, setTrends] = useState<Trend[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('user');

    const API_URL = 'https://war-prophet-logos-twiki.trycloudflare.com';

    useEffect(() => {
        const fetchTrends = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/trends/1`);
                const processedTrends = response.data.map((trend: any) => ({
                    ...trend,
                    tweet_volume: trend.tweet_volume || 'No disponible'
                }));
                setTrends(processedTrends.slice(0, 10));
                setLoading(false);
            } catch (err) {
                setError('Error al obtener tendencias');
                setLoading(false);
                console.error(err);
            }
        };

        fetchTrends();
    }, []);

    const fetchUserTweets = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username) return;

        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/user_timeline/${username}`);
            setTweets(response.data);
            setActiveTab('user');
            setLoading(false);
        } catch (err) {
            setError('Error al obtener tweets del usuario');
            setLoading(false);
            console.error(err);
        }
    };

    const postTweet = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTweet) return;

        try {
            setLoading(true);
            await axios.post(`${API_URL}/tweet`, { text: newTweet });
            setNewTweet('');
            setLoading(false);
            alert('Tweet publicado con éxito!');
        } catch (err) {
            setError('Error al publicar tweet');
            setLoading(false);
            console.error(err);
        }
    };

    const searchTweets = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hashtag) return;

        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/search/${hashtag}`);
            setSearchResults(response.data);
            setActiveTab('search');
            setLoading(false);
        } catch (err) {
            setError('Error al buscar tweets');
            setLoading(false);
            console.error(err);
        }
    };

    const renderTweets = (tweetsList: Tweet[]) => {
        return tweetsList.map((tweet) => (
            <div key={tweet.id} className="border p-4 mb-4 rounded-lg shadow-sm bg-gray-50">
                <div className="flex items-center mb-2">
                    <strong className="text-blue-500">@{tweet.user_screen_name}</strong>
                    <span className="ml-2 text-gray-500 text-sm">
                        {new Date(tweet.created_at).toLocaleDateString()}
                    </span>
                </div>
                <p className="mb-2">{tweet.text}</p>
                <div className="flex text-sm text-gray-600">
                    <span className="mr-4">♥ {tweet.favorite_count}</span>
                    <span>🔄 {tweet.retweet_count}</span>
                </div>
            </div>
        ));
    };

    const renderTrends = () => {
        if (loading) return <p className="py-4">Cargando tendencias...</p>;

        if (!trends.length) return <p className="py-4">No se encontraron tendencias</p>;

        return (
            <div className="flex flex-wrap gap-2">
                {trends.map((trend, index) => (
                    <a
                        key={index}
                        href={trend.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-sm hover:bg-blue-200 transition-colors"
                        title={`Volumen de tweets: ${trend.tweet_volume}`}
                    >
                        {trend.name}
                    </a>
                ))}
            </div>
        );
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-[#181752] rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-center">Integración con Twitter API</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Tendencias Globales</h2>
                {renderTrends()}
            </div>

            <div className="flex mb-6 border-b">
                <button
                    className={`py-2 px-4 ${activeTab === 'user' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('user')}
                >
                    Tweets de usuario
                </button>
                <button
                    className={`py-2 px-4 ${activeTab === 'post' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('post')}
                >
                    Publicar tweet
                </button>
                <button
                    className={`py-2 px-4 ${activeTab === 'search' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('search')}
                >
                    Buscar por hashtag
                </button>
            </div>

            {activeTab === 'user' && (
                <div>
                    <form onSubmit={fetchUserTweets} className="mb-6">
                        <div className="flex">
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Nombre de usuario (sin @)"
                                className="flex-1 p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-300"
                                required
                            />
                            <button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r transition-colors disabled:bg-blue-300"
                                disabled={loading}
                            >
                                {loading ? 'Cargando...' : 'Buscar Tweets'}
                            </button>
                        </div>
                    </form>

                    {tweets.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Tweets de @{username}</h3>
                            {renderTweets(tweets)}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'post' && (
                <div>
                    <form onSubmit={postTweet}>
                        <div className="mb-4">
                            <textarea
                                value={newTweet}
                                onChange={(e) => setNewTweet(e.target.value)}
                                placeholder="¿Qué está pasando?"
                                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                                rows={4}
                                maxLength={280}
                                required
                            />
                            <div className="text-right text-sm text-gray-500">
                                {newTweet.length}/280
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full transition-colors disabled:bg-blue-300"
                            disabled={loading}
                        >
                            {loading ? 'Publicando...' : 'Publicar Tweet'}
                        </button>
                    </form>
                </div>
            )}

            {activeTab === 'search' && (
                <div>
                    <form onSubmit={searchTweets} className="mb-6">
                        <div className="flex">
                            <input
                                type="text"
                                value={hashtag}
                                onChange={(e) => setHashtag(e.target.value)}
                                placeholder="Hashtag (sin #)"
                                className="flex-1 p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-300"
                                required
                            />
                            <button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r transition-colors disabled:bg-blue-300"
                                disabled={loading}
                            >
                                {loading ? 'Buscando...' : 'Buscar'}
                            </button>
                        </div>
                    </form>

                    {searchResults.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Resultados para #{hashtag}</h3>
                            {renderTweets(searchResults)}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TwitterIntegration;