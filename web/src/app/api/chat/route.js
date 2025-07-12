import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AskAdhikaarAI } from "@/src/actions/AdhikaarAI";

export async function POST(req) {
  try {
    const body = await req.json();
    const { messages, chatWith, userId, chatSessionId } = body;

    const latestMessage = messages[messages.length - 1];

    if (chatWith === "AI") {
      try {
        // For AI chat, we'll always try to get a response even without a session

        const queryParams = new URLSearchParams({
          user_query: latestMessage.content,
        });
        const response = await AskAdhikaarAI(queryParams);

        console.log("FastAPI response:", response);

        return NextResponse.json({
          response: response.message,
          reference: response.reference || [],
          category: response.category || [],
          type: response.type || "general",
          success: true,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("API error:", error);
      }
    }

    if (chatWith === "lawyer" || chatWith === "admin") {
      // Store user message for lawyer chat
      if (chatSessionId && userId) {
        await prisma.message.create({
          data: {
            content: latestMessage.content,
            messageType: "TEXT",
            senderType: "USER",
            chatSessionId: chatSessionId,
            userId: userId,
            aiResponse: false,
          },
        });
      }

      // The message will be sent via Socket.IO from the client
      return NextResponse.json({
        success: true,
        message: "Message will be sent to lawyer via Socket.IO",
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
