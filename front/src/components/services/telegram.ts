
/**
 * Represents the result of sending a Telegram message.
 */
export interface TelegramResponse {
  /**
   * Indicates whether the message was sent successfully.
   */
  success: boolean;
  /**
   * An optional message providing additional information about the result.
   */
  message?: string;
  /**
   * Optional response from the bot.
   */
  bot_response?: string;
}
/**
 * Asynchronously sends a message to a Telegram chat using an external service.
 *
 * @param chatId The ID of the Telegram chat.
 * @param message The message to send.
 * @returns A promise that resolves to a TelegramResponse object indicating success or failure.
 */
export async function sendTelegramMessage(
  chatId: string,
  message: string
): Promise<TelegramResponse> {
  console.log(`Sending telegram message to chat ID: ${chatId} with message: ${message}`);

  try {
    const res = await fetch("http://localhost:5000/api/telegram/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chat_id: chatId, message }),
    });

    if (!res.ok) {
      const error = await res.text();
      return {
        success: false,
        message: `Error from server: ${error}`,
      };
    }

    const data = await res.json();

    return {
      success: true,
      message: "Mensaje enviado correctamente",
      bot_response: data.result?.text ?? null,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Error desconocido al enviar mensaje",
    };
  }
}


