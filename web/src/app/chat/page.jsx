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
import { Search, Filter } from "lucide-react";

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
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false);
  const [filteredLawyers, setFilteredLawyers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Location");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialty");
  const [locations, setLocations] = useState([]);
  const [specialties, setSpecialties] = useState([]);
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
          setFilteredLawyers(data.lawyers);
          extractFilters(data.lawyers);
        }
      } catch (error) {
        console.error("Error fetching lawyers:", error);
      }
    };

    fetchLawyers();
  }, []);

  // Extract filter options from lawyers data
  const extractFilters = (lawyersList) => {
    const citySet = new Set();
    const specialtySet = new Set();
    lawyersList.forEach((lawyer) => {
      if (lawyer.city) citySet.add(lawyer.city);
      if (Array.isArray(lawyer.specialty)) {
        lawyer.specialty.forEach((spec) => specialtySet.add(spec));
      }
    });
    setLocations(["All Location", ...Array.from(citySet)]);
    setSpecialties(["All Specialty", ...Array.from(specialtySet)]);
  };

  // Handle lawyer search and filtering dynamically
  useEffect(() => {
    let filtered = [...lawyers];

    if (searchTerm) {
      filtered = filtered.filter(
        (lawyer) =>
          lawyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lawyer.specialty.some((s) =>
            s.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    if (selectedLocation !== "All Location") {
      filtered = filtered.filter((lawyer) => lawyer.city === selectedLocation);
    }

    if (selectedSpecialty !== "All Specialty") {
      filtered = filtered.filter((lawyer) =>
        lawyer.specialty.some((s) => s === selectedSpecialty)
      );
    }

    setFilteredLawyers(filtered);
  }, [lawyers, searchTerm, selectedLocation, selectedSpecialty]);

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
    setHasUserSentMessage(true); // Set to true when user sends first message

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

        if (data.success && data.response) {
          const aiMessage = {
            id: (Date.now() + 1).toString(),
            content: data.response,
            sender: "ai",
            timestamp: new Date(),
            messageType: "TEXT",
            reference: data.reference || [],
            category: data.category || [],
            fallback: data.fallback || false,
          };
          setMessages((prev) => [...prev, aiMessage]);
        } else {
          // Handle API error response
          const errorMessage = {
            id: (Date.now() + 1).toString(),
            content:
              data.error ||
              "Sorry, I couldn't process your request. Please try again.",
            sender: "system",
            timestamp: new Date(),
            messageType: "SYSTEM",
          };
          setMessages((prev) => [...prev, errorMessage]);
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
    <div className="flex w-full h-screen">
      {/* Left side - Chat (50% width when split, full width when not split) */}
      <div
        className={`${
          hasUserSentMessage ? "w-1/2" : "w-full"
        } flex items-center justify-center p-4 transition-all duration-300`}
      >
        <Card className="w-full max-w-4xl h-full flex flex-col">
          <CardHeader className="flex-shrink-0">
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
                    <label className="text-sm font-medium">
                      Select Lawyer:
                    </label>
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

          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.sender === "user"
                          ? "bg-blue-500 text-white"
                          : message.sender === "ai"
                          ? message.fallback
                            ? "bg-orange-100 text-orange-800 border border-orange-200"
                            : "bg-green-100 text-green-800 border border-green-200"
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
                          ? `🤖 AI Assistant${
                              message.fallback ? " (Limited Mode)" : ""
                            }`
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

                      {/* Show fallback indicator for AI messages */}
                      {message.sender === "ai" && message.fallback && (
                        <div className="mt-2 text-xs text-orange-600 font-medium">
                          ⚠️ Limited response due to temporary connectivity
                          issues
                        </div>
                      )}

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
                                  className={`px-2 py-1 rounded text-xs ${
                                    message.fallback
                                      ? "bg-orange-200 text-orange-700"
                                      : "bg-green-200 text-green-700"
                                  }`}
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

          <CardFooter className="flex-shrink-0">
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

      {/* Right side - Lawyers List (only visible after first message) */}
      {hasUserSentMessage && (
        <div className="w-1/2 p-4 bg-gray-50 border-l transition-all duration-300">
          <div className="h-full overflow-hidden">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-[#082567] mb-2">
                Available Lawyers
              </h2>
              <p className="text-gray-600 text-sm">
                Connect with registered and verified lawyers
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Showing {filteredLawyers.length} of {lawyers.length} lawyers
              </p>
            </div>

            {/* Search and Filter Controls */}
            <div className="grid grid-cols-1 gap-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search lawyers or specialties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={selectedLocation}
                  onValueChange={setSelectedLocation}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedSpecialty}
                  onValueChange={setSelectedSpecialty}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Lawyers Grid */}
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="pr-4">
                {filteredLawyers.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {filteredLawyers.map((lawyer) => (
                      <div
                        key={lawyer.id}
                        className="lawyer-card lawyer-grid-card bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 p-3 border cursor-pointer"
                        onClick={() => {
                          setSelectedLawyer(lawyer);
                          setChatWith("lawyer");
                        }}
                      >
                        <div className="flex flex-col items-center text-center h-full">
                          <img
                            src={lawyer.profilePicture}
                            alt={lawyer.name}
                            className="w-16 h-16 rounded-full border-2 border-blue-100 object-cover mb-2"
                          />
                          <div className="w-full flex-1 flex flex-col">
                            <div className="flex items-center justify-center mb-1">
                              <h3 className="font-semibold text-gray-800 text-sm truncate mr-1">
                                {lawyer.name}
                              </h3>
                              <span className="text-xs bg-green-100 text-green-700 px-1 py-0.5 rounded-full flex-shrink-0">
                                ✓
                              </span>
                            </div>
                            <p className="text-xs text-blue-600 mb-1">
                              {lawyer.specialty.length > 0 && (
                                <>
                                  {lawyer.specialty[0].replace(/_/g, " ")}
                                  {lawyer.specialty.length > 1 && " +"}
                                </>
                              )}
                            </p>
                            <div className="lawyer-description text-xs text-gray-600 mb-2">
                              {lawyer.description}
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-500 mt-auto">
                              <span className="truncate">📍 {lawyer.city}</span>
                              <span className="flex-shrink-0 ml-1">
                                {lawyer.noOfCases} cases
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <p className="text-sm">
                      No lawyers found matching your criteria.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedLocation("All Location");
                        setSelectedSpecialty("All Specialty");
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
}
