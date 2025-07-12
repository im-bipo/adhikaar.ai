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

export default function AdminChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [stats, setStats] = useState({
    connectedUsers: 0,
    connectedAdmins: 0,
    usersList: [],
  });
  const [activeUsers, setActiveUsers] = useState(new Map());
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTyping, setUserTyping] = useState(new Set());
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    socketRef.current = io(socketUrl);

    socketRef.current.on("connect", () => {
      setIsConnected(true);
      console.log("Admin connected to Socket.IO server");

      // Join admin room
      socketRef.current?.emit("join-admin", {
        adminId: "admin-" + Date.now(),
        role: "admin",
        timestamp: new Date().toISOString(),
      });
    });

    socketRef.current.on("disconnect", () => {
      setIsConnected(false);
      console.log("Admin disconnected from Socket.IO server");
    });

    socketRef.current.on("admin-stats", (data) => {
      setStats(data);
      const usersMap = new Map();
      data.usersList.forEach((user) => {
        usersMap.set(user.socketId, user);
      });
      setActiveUsers(usersMap);
    });

    socketRef.current.on("user-connected", (data) => {
      setStats((prev) => ({ ...prev, connectedUsers: data.totalUsers }));
      setActiveUsers((prev) => new Map(prev.set(data.socketId, data.userData)));
    });

    socketRef.current.on("user-disconnected", (data) => {
      setStats((prev) => ({ ...prev, connectedUsers: data.totalUsers }));
      setActiveUsers((prev) => {
        const newMap = new Map(prev);
        newMap.delete(data.socketId);
        return newMap;
      });
    });

    socketRef.current.on("user-message", (data) => {
      const newMessage = {
        id: Date.now().toString(),
        content: data.content,
        sender: "user",
        timestamp: new Date(data.timestamp),
        socketId: data.socketId,
      };
      setMessages((prev) => [...prev, newMessage]);

      // Remove typing indicator for this user
      setUserTyping((prev) => {
        const newSet = new Set(prev);
        newSet.delete(data.socketId);
        return newSet;
      });
    });

    socketRef.current.on("user-typing", (data) => {
      setUserTyping((prev) => new Set(prev.add(data.socketId)));
    });

    socketRef.current.on("user-stop-typing", (data) => {
      setUserTyping((prev) => {
        const newSet = new Set(prev);
        newSet.delete(data.socketId);
        return newSet;
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || !socketRef.current) return;

    const adminMessage = {
      id: Date.now().toString(),
      content: input.trim(),
      sender: "admin",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, adminMessage]);

    // Send message via Socket.IO
    socketRef.current.emit("admin-response", {
      content: input.trim(),
      timestamp: new Date().toISOString(),
      targetSocketId: selectedUser, // Send to specific user if selected
    });

    setInput("");
  };

  const filteredMessages = selectedUser
    ? messages.filter(
        (msg) => msg.socketId === selectedUser || msg.sender === "admin"
      )
    : messages;

  return (
    <div className="content-grid min-h-screen w-full p-4">
      <div className="w-full h-[90vh] flex gap-4">
        {/* Chat Section - Left Side */}
        <div className="flex-1">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Admin Chat Interface</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={isConnected ? "default" : "destructive"}>
                    {isConnected ? "Connected" : "Disconnected"}
                  </Badge>
                  <Badge variant="secondary">
                    {stats.connectedUsers} users online
                  </Badge>
                  {selectedUser && (
                    <Badge variant="outline">
                      Chatting with:{" "}
                      {activeUsers.get(selectedUser)?.userId || selectedUser}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {filteredMessages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      {selectedUser
                        ? "No messages with this user yet..."
                        : "Waiting for user messages..."}
                    </div>
                  ) : (
                    filteredMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender === "admin"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.sender === "admin"
                              ? "bg-purple-500 text-white"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          <div className="text-sm font-medium mb-1">
                            {message.sender === "admin"
                              ? "You (Admin)"
                              : `User (${
                                  activeUsers.get(message.socketId || "")
                                    ?.userId || message.socketId
                                })`}
                          </div>
                          <div>{message.content}</div>
                          <div className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {Array.from(userTyping).map((socketId) => (
                    <div
                      key={`typing-${socketId}`}
                      className="flex justify-start"
                    >
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <div className="text-sm">
                          {activeUsers.get(socketId)?.userId || socketId} is
                          typing...
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter>
              <form onSubmit={handleSubmit} className="flex w-full gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    selectedUser
                      ? `Reply to ${
                          activeUsers.get(selectedUser)?.userId || selectedUser
                        }...`
                      : "Type your response to all users..."
                  }
                  disabled={!isConnected}
                  className="flex-1"
                />
                <Button type="submit" disabled={!isConnected || !input.trim()}>
                  Send
                </Button>
                {selectedUser && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedUser(null)}
                  >
                    Clear Selection
                  </Button>
                )}
              </form>
            </CardFooter>
          </Card>
        </div>

        {/* Users Section - Right Side */}
        <div className="w-80">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Connected Users</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <ScrollArea className="h-full">
                <div className="space-y-2">
                  {Array.from(activeUsers.entries()).map(
                    ([socketId, userInfo]) => (
                      <div
                        key={socketId}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedUser === socketId
                            ? "bg-blue-100 border-blue-300"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedUser(socketId)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{userInfo.userId}</div>
                            <div className="text-sm text-gray-500">
                              Socket: {socketId}
                            </div>
                            <div className="text-xs text-gray-400">
                              Connected:{" "}
                              {new Date(userInfo.connectedAt).toLocaleString()}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {userTyping.has(socketId) && (
                              <Badge variant="secondary">Typing...</Badge>
                            )}
                            <Badge variant="default">Online</Badge>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                  {activeUsers.size === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      No users connected
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
