import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();
    const { messages, chatWith, userId, chatSessionId } = body;

    const latestMessage = messages[messages.length - 1];

    if (chatWith === "AI") {
      try {
        // For AI chat, we'll always try to get a response even without a session
        const fastApiUrl = process.env.FASTAPI_URL || "http://127.0.0.1:8000";
        console.log(`Attempting to connect to FastAPI at: ${fastApiUrl}/query`);

        const queryParams = new URLSearchParams({
          user_query: latestMessage.content,
        });
        const response = await fetch(`${fastApiUrl}/query?${queryParams}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log(queryParams.toString());
        console.log("FastAPI response status:", response.status);
        console.log(fastApiUrl);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`FastAPI responded with status: ${response.status}`);
          console.error(`FastAPI error response:`, errorText);
          throw new Error(
            `FastAPI responded with status: ${response.status} - ${errorText}`
          );
        }

        const aiData = await response.json();
        console.log("FastAPI response:", aiData);

        // Only store messages if we have a chat session
        if (chatSessionId && userId) {
          try {
            // Store user message
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

            // Store AI response
            await prisma.message.create({
              data: {
                content: aiData.message,
                messageType: "TEXT",
                senderType: "AI",
                chatSessionId: chatSessionId,
                aiResponse: true,
                aiModel: "legal-assistant-v1",
              },
            });
          } catch (dbError) {
            console.error("Error saving messages to database:", dbError);
            // Continue anyway, don't fail the whole request
          }
        }

        return NextResponse.json({
          response: aiData.message,
          reference: aiData.reference || [],
          category: aiData.category || [],
          type: aiData.type || "general",
          success: true,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("FastAPI error:", error);

        // Try to check if FastAPI server is running
        try {
          const fastApiUrl = process.env.FASTAPI_URL || "http://127.0.0.1:8000";
          const healthCheck = await fetch(`${fastApiUrl}/health`, {
            method: "GET",
          });
          if (healthCheck.ok) {
            console.log("FastAPI server is running but /query endpoint failed");
          }
        } catch (healthError) {
          console.error(
            "FastAPI server appears to be down:",
            healthError.message
          );
        }

        // Fallback response if FastAPI is unavailable
        const fallbackResponses = [
          "I understand you have a legal question. While I'm currently having connectivity issues with my full knowledge base, I can provide some general guidance. For specific legal advice, please consult with a qualified lawyer.",
          "I'm here to help with legal questions. Currently experiencing some technical issues, but I can offer general information. For detailed legal advice, please contact a licensed attorney.",
          "Thank you for your legal inquiry. I'm currently having trouble accessing my complete legal database, but I can provide basic information. For specific cases, please consult with a legal professional.",
          "I see you have a legal question. While my full AI capabilities are temporarily limited, I can offer general guidance. For personalized legal advice, please speak with a qualified lawyer.",
        ];

        const randomFallback =
          fallbackResponses[
            Math.floor(Math.random() * fallbackResponses.length)
          ];

        return NextResponse.json({
          response: randomFallback,
          success: true,
          fallback: true,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
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
