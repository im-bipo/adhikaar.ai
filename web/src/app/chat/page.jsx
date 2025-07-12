"use client";

import React from "react";

import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatWith, setChatWith] = useState("AI");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    socketRef.current = io(socketUrl);

    socketRef.current.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to Socket.IO server");

      // Identify this user
      socketRef.current?.emit("identify-user", {
        userId: "user-" + Date.now(),
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });

      // Load chat history
      socketRef.current?.emit("get-chat-history", (history) => {
        const loadedMessages = history.map((msg, index) => ({
          id: `history-${index}`,
          content: msg.content,
          sender:
            msg.type === "user"
              ? "user"
              : msg.type === "admin"
              ? "admin"
              : "ai",
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(loadedMessages);
      });
    });

    socketRef.current.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from Socket.IO server");
    });

    socketRef.current.on("admin-message", (data) => {
      const newMessage = {
        id: Date.now().toString(),
        content: data.content,
        sender: "admin",
        timestamp: new Date(data.timestamp),
      };
      setMessages((prev) => [...prev, newMessage]);
      setAdminTyping(false);
    });

    socketRef.current.on("admin-typing", () => {
      setAdminTyping(true);
    });

    socketRef.current.on("admin-stop-typing", () => {
      setAdminTyping(false);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputChange = (e) => {
    setInput(e.target.value);

    if (chatWith === "admin" && socketRef.current) {
      if (!isTyping) {
        setIsTyping(true);
        socketRef.current.emit("user-typing", { content: e.target.value });
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        socketRef.current?.emit("user-stop-typing");
      }, 1000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      content: input.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      socketRef.current?.emit("user-stop-typing");
    }

    try {
      if (chatWith === "AI") {
        // Handle AI chat via API
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            chatWith: chatWith,
          }),
        });

        const data = await response.json();

        if (data.response) {
          const aiMessage = {
            id: (Date.now() + 1).toString(),
            content: data.response,
            sender: "ai",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, aiMessage]);
        }
      } else {
        // Handle admin chat via Socket.IO
        if (socketRef.current) {
          socketRef.current.emit("user-to-admin", {
            content: userMessage.content,
            timestamp: userMessage.timestamp.toISOString(),
          });
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
      setInput("");
    }
  };

  return (
    <div className="flex w-full items-center justify-center p-4">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Chat System</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
              <div className="flex gap-2">
                <Button
                  variant={chatWith === "AI" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChatWith("AI")}
                >
                  AI Chat
                </Button>
                <Button
                  variant={chatWith === "admin" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChatWith("admin")}
                >
                  Admin Chat
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.sender === "user"
                        ? "bg-blue-500 text-white"
                        : message.sender === "ai"
                        ? "bg-green-100 text-green-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    <div className="text-sm font-medium mb-1">
                      {message.sender === "user"
                        ? "You"
                        : message.sender === "ai"
                        ? "AI"
                        : "Admin"}
                    </div>
                    <div>{message.content}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {(isLoading || adminTyping) && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="text-sm">
                      {isLoading && chatWith === "AI"
                        ? "AI is typing..."
                        : adminTyping
                        ? "Admin is typing..."
                        : "Waiting for admin..."}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder={`Type your message to ${chatWith}...`}
              disabled={isLoading || !isConnected}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim() || !isConnected}
            >
              Send
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
