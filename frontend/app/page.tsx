"use client";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { useState } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState<
    { id: string; role: string; content: string }[]
  >([]);

  return (
    <div className="flex flex-col items-center min-h-screen p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Title</h1>

      <Card className="w-full h-80vh flex flex-col p-4 shadow-lg">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center text-muted-foreground">
              <div>
                <p className="mb-2">👋 Hello!</p>
                <p>How can I help you today?</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start gap-2 max-w-[80%] ${
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    {message.role === "user" ? (
                      <div className="bg-primary text-primary-foreground h-full w-full flex items-center justify-center text-sm">
                        U
                      </div>
                    ) : (
                      <div className="bg-muted h-full w-full flex items-center justify-center text-sm">
                        AI
                      </div>
                    )}
                  </Avatar>
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <form className="flex gap-2">
          <Input placeholder="Type your message..." className="flex-1" />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
}
