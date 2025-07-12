"use client";

import React from "react";
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useUser } from "@clerk/nextjs";
import "./chat.css";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ChatPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatWith, setChatWith] = useState("AI");
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [lawyers, setLawyers] = useState([]);
  const [chatSession, setChatSession] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Fetch available lawyers
  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        const response = await fetch("/api/lawyer");
        const data = await response.json();
        if (data.success) {
          setLawyers(data.lawyers);
        }
      } catch (error) {
        console.error("Error fetching lawyers:", error);
      }
    };

    fetchLawyers();
  }, []);

  // Initialize chat session when user or lawyer is selected
  useEffect(() => {
    const initializeChatSession = async () => {
      if (!user) return;

      try {
        const response = await fetch("/api/chat-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clerkId: user.id,
            userEmail: user.emailAddresses?.[0]?.emailAddress,
            userName:
              user.fullName ||
              `${user.firstName || ""} ${user.lastName || ""}`.trim(),
            lawyerId: selectedLawyer?.id || null,
          }),
        });

        const data = await response.json();
        if (data.success) {
          setChatSession(data.chatSession);
          // Load existing messages from the session
          setMessages(
            data.chatSession.messages.map((msg) => ({
              id: msg.id,
              content: msg.content,
              sender: msg.senderType.toLowerCase(),
              timestamp: new Date(msg.createdAt),
              messageType: msg.messageType,
            }))
          );
        }
      } catch (error) {
        console.error("Error initializing chat session:", error);
      }
    };

    if (chatWith === "lawyer" && selectedLawyer) {
      initializeChatSession();
    } else if (chatWith === "AI") {
      initializeChatSession();
    }
  }, [user, chatWith, selectedLawyer]);

  useEffect(() => {
    if (!user) return;

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    socketRef.current = io(socketUrl);

    socketRef.current.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to Socket.IO server");

      // Identify this user
      socketRef.current?.emit("identify-user", {
        userId: user.id,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });

      // Join chat session if exists
      if (chatSession?.id) {
        socketRef.current?.emit("user-join-chat", {
          chatSessionId: chatSession.id,
          userId: user.id,
        });
      }
    });

    socketRef.current.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from Socket.IO server");
    });

    // Handle chat messages
    socketRef.current.on("chat-message", (data) => {
      const newMessage = {
        id: data.id || Date.now().toString(),
        content: data.content,
        sender: data.senderType.toLowerCase(),
        timestamp: new Date(data.timestamp),
        messageType: data.messageType,
      };
      setMessages((prev) => [...prev, newMessage]);
      setAdminTyping(false);
    });

    // Handle lawyer joining notification
    socketRef.current.on("lawyer-joined", (data) => {
      const joinMessage = {
        id: data.id,
        content: data.content,
        sender: "system",
        timestamp: new Date(data.timestamp),
        messageType: data.messageType,
      };
      setMessages((prev) => [...prev, joinMessage]);
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
  }, [user, chatSession]);

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
    if (!input.trim() || !user) return;

    const userMessage = {
      id: Date.now().toString(),
      content: input.trim(),
      sender: "user",
      timestamp: new Date(),
      messageType: "TEXT",
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
            userId: user.id,
            chatSessionId: chatSession?.id,
          }),
        });

        const data = await response.json();

        if (data.response) {
          const aiMessage = {
            id: (Date.now() + 1).toString(),
            content: data.response,
            sender: "ai",
            timestamp: new Date(),
            messageType: "TEXT",
            reference: data.reference || [],
            category: data.category || [],
          };
          setMessages((prev) => [...prev, aiMessage]);
        }
      } else if (chatWith === "lawyer" && selectedLawyer) {
        // Handle lawyer chat via Socket.IO
        if (socketRef.current && chatSession?.id) {
          socketRef.current.emit("user-to-chat", {
            content: userMessage.content,
            timestamp: userMessage.timestamp.toISOString(),
            chatSessionId: chatSession.id,
            userId: user.id,
          });
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);

      // Show error message
      const errorMessage = {
        id: (Date.now() + 2).toString(),
        content:
          "Sorry, there was an error sending your message. Please try again.",
        sender: "system",
        timestamp: new Date(),
        messageType: "SYSTEM",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setInput("");
    }
  };

  return (
    <div className="flex w-full items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <CardTitle>Legal Assistant Chat</CardTitle>
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
            </div>

            {/* Chat Type Selection */}
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="flex gap-2">
                <Button
                  variant={chatWith === "AI" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setChatWith("AI");
                    setSelectedLawyer(null);
                  }}
                >
                  AI Assistant
                </Button>
                <Button
                  variant={chatWith === "lawyer" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChatWith("lawyer")}
                >
                  Lawyer Chat
                </Button>
              </div>

              {/* Lawyer Selection */}
              {chatWith === "lawyer" && (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Select Lawyer:</label>
                  <Select
                    onValueChange={(value) => {
                      const lawyer = lawyers.find((l) => l.id === value);
                      setSelectedLawyer(lawyer);
                    }}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Choose a lawyer" />
                    </SelectTrigger>
                    <SelectContent>
                      {lawyers.map((lawyer) => (
                        <SelectItem key={lawyer.id} value={lawyer.id}>
                          {lawyer.name} -{" "}
                          {lawyer.specialty[0]?.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Chat Info */}
            {chatWith === "AI" && (
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                💡 Ask me legal questions in any language. I can help with
                Nepali law, provide legal guidance, and explain complex legal
                concepts.
              </div>
            )}

            {chatWith === "lawyer" && selectedLawyer && (
              <div className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                👨‍💼 You're now connected with{" "}
                <strong>{selectedLawyer.name}</strong> (
                {selectedLawyer.specialty.join(", ").replace(/_/g, " ")})
              </div>
            )}

            {chatWith === "lawyer" && !selectedLawyer && (
              <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
                ⚠️ Please select a lawyer to start chatting
              </div>
            )}
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
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : message.sender === "lawyer"
                        ? "bg-purple-100 text-purple-800 border border-purple-200"
                        : message.sender === "system"
                        ? "bg-yellow-50 text-yellow-800 border border-yellow-200 text-center"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <div
                      className={`text-sm font-medium mb-1 ${
                        message.sender === "system" ? "hidden" : ""
                      }`}
                    >
                      {message.sender === "user"
                        ? "You"
                        : message.sender === "ai"
                        ? "🤖 AI Assistant"
                        : message.sender === "lawyer"
                        ? `👨‍💼 ${selectedLawyer?.name || "Lawyer"}`
                        : "System"}
                    </div>
                    <div
                      className={
                        message.sender === "system" ? "font-medium" : ""
                      }
                    >
                      {message.content}
                    </div>

                    {/* Show references for AI messages */}
                    {message.sender === "ai" &&
                      message.reference &&
                      message.reference.length > 0 && (
                        <div className="mt-2 text-xs">
                          <div className="font-medium">References:</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {message.reference.map((ref, index) => (
                              <span
                                key={index}
                                className="bg-green-200 px-2 py-1 rounded text-green-700"
                              >
                                {ref}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicators */}
              {adminTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                    <div className="text-sm font-medium mb-1">
                      {chatWith === "lawyer" ? "Lawyer" : "Admin"}
                    </div>
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
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
              placeholder={
                chatWith === "AI"
                  ? "Ask me any legal question..."
                  : chatWith === "lawyer" && selectedLawyer
                  ? `Type your message to ${selectedLawyer.name}...`
                  : "Select a lawyer first..."
              }
              disabled={
                isLoading ||
                !isConnected ||
                (chatWith === "lawyer" && !selectedLawyer)
              }
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={
                isLoading ||
                !input.trim() ||
                !isConnected ||
                (chatWith === "lawyer" && !selectedLawyer)
              }
            >
              {isLoading ? "Sending..." : "Send"}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
