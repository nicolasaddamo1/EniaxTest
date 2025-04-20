"use client";

import { useToast } from "@/hooks/use-toast";
import { sendViberMessage } from "../services/viber";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useState } from "react";


export function ViberForm() {
  const [receiverId, setReceiverId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSendViber = async () => {
    setLoading(true);
    try {
      const response = await sendViberMessage(receiverId, message);
      if (response.success) {
        toast({
          title: "Viber Message Sent",
          description: response.message || "Message sent successfully!",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error Sending Viber Message",
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
      <h2 className="text-lg font-semibold text-center">Viber</h2>
      <Input
        type="text"
        placeholder="Viber Receiver ID"
        value={receiverId}
        onChange={(e) => setReceiverId(e.target.value)}
      />
      <Textarea
        placeholder="Viber Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <Button onClick={handleSendViber} disabled={loading} className="w-full mt-auto">
        {loading ? "Send Viber Message" : "Send Viber Message"}
      </Button>
    </div>
  );
}

