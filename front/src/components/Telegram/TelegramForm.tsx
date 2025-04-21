"use client";

import { useEffect, useState } from "react";
import { sendTelegramMessage } from "../services/telegram";
import { CardContent, CardHeader, CardTitle } from "../ui/card";

export default function TelegramForm() {
    const [chatId, setChatId] = useState("");
    const [message, setMessage] = useState("");
    const [response, setResponse] = useState("");

    useEffect(() => {
        // Inyectar el script solo una vez
        const script = document.createElement("script");
        script.src = "https://telegram.org/js/telegram-widget.js?7";
        script.async = true;
        script.setAttribute("data-telegram-login", "eniaxtest_bot"); // <-- reemplazá por el username real
        script.setAttribute("data-size", "large");
        script.setAttribute("data-radius", "10");
        script.setAttribute("data-request-access", "write");
        script.setAttribute("data-auth-url", "https://apt-searches-ph-firm.trycloudflare.com");

        const container = document.getElementById("telegram-button-container");
        if (container && !container.hasChildNodes()) {
            container.appendChild(script);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await sendTelegramMessage(chatId, message);
        setResponse(JSON.stringify(res, null, 2));
    };

    return (
        <CardContent style={{ alignItems: "center", display: "flex", flexDirection: "column", gap: "3rem" }} >
            <CardHeader>
                <CardTitle>
                    Telegram Bot
                </CardTitle>
            </CardHeader>

            {/* Widget oficial de Telegram */}
            <div id="telegram-button-container" style={{ marginBottom: "1rem", textAlign: "center" }} />

            {/* Formulario personalizado */}
            <form
                onSubmit={handleSubmit}
                style={{
                    padding: "1rem",
                    alignItems: "center",
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "#999999",
                    borderRadius: "8px",
                }}
            >
                <div>
                    <label>Chat ID:</label>
                    <input
                        value={chatId}
                        style={{
                            backgroundColor: "gray",
                            color: "white",
                            marginLeft: "6px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            padding: "0.5rem",
                        }}
                        onChange={(e) => setChatId(e.target.value)}
                        placeholder="152215997"
                        required
                    />
                </div>
                <div>
                    <label>Mensaje:</label>
                    <input
                        style={{
                            backgroundColor: "gray",
                            color: "white",
                            marginTop: "6px",
                            marginBottom: "6px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            padding: "0.5rem",
                        }}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Ej: Hola desde mi app"
                        required
                    />
                </div>
                <button
                    type="submit"
                    style={{
                        backgroundColor: "#0088cc",
                        color: "white",
                        padding: "0.5rem 1rem",
                        border: "none",
                        cursor: "pointer",
                    }}
                >
                    Enviar
                </button>
                {response && (
                    <pre style={{ marginTop: "1rem", backgroundColor: "gray", padding: "1rem", color: "white" }}>
                        {response}
                    </pre>
                )}
            </form>
        </CardContent >
    );
}
