import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { messages, chatWith } = body;

    const latestMessage = messages[messages.length - 1];

    if (chatWith === "AI") {
      // Simulate AI response with slight delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      const aiResponses = [
        "Hello from AI! How can I help you today?",
        "I'm here to assist you with any questions you have.",
        "That's an interesting question! Let me think about that.",
        "I understand what you're asking. Here's what I think...",
        "Thanks for your message! I'm processing your request.",
        "I'm an AI assistant ready to help you with various tasks.",
        "Feel free to ask me anything you'd like to know!",
        "I'm here 24/7 to provide assistance and answer questions.",
      ];

      const randomResponse =
        aiResponses[Math.floor(Math.random() * aiResponses.length)];

      return NextResponse.json({
        response: randomResponse,
        success: true,
        timestamp: new Date().toISOString(),
      });
    }

    if (chatWith === "admin") {
      // The message will be sent via Socket.IO from the client
      // This endpoint just confirms the message was received
      return NextResponse.json({
        success: true,
        message: "Message will be sent to admin via Socket.IO",
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid chat preference" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
