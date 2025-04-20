"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { sendTelegramMessage } from "../services/telegram";

export function TelegramForm() {
  const [chatId, setChatId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSendTelegram = async () => {
    setLoading(true);
    try {
      const response = await sendTelegramMessage(chatId, message);
      if (response.success) {
        toast({
          title: "Telegram Message Sent",
          description: response.message || "Message sent successfully!",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error Sending Telegram Message",
          description: response.message || "Failed to send message.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4 h-full">
      <h2 className="text-lg font-semibold text-center">Telegram</h2>
      <>
        <Input
          type="text"
          placeholder="Telegram Chat ID"
          value={chatId}
          onChange={(e) => setChatId(e.target.value)}
        />
        <Textarea
          placeholder="Telegram Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button onClick={handleSendTelegram} disabled={loading} className="w-full mt-auto">
          {loading ? "Send Telegram Message" : "Send Telegram Message"}
        </Button>
      </>
    </div>
  );
}
