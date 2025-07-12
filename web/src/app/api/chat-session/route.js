import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, lawyerId, clerkId, userEmail, userName } = body;

    let finalUserId = userId;

    // If userId is provided but doesn't exist, or if we have clerkId, try to find/create user
    if (clerkId || (!userId && (userEmail || userName))) {
      let user = null;

      if (clerkId) {
        // Try to find user by clerkId
        user = await prisma.user.findUnique({
          where: { clerkId: clerkId },
        });
      }

      if (!user && userEmail) {
        // Try to find user by email
        user = await prisma.user.findFirst({
          where: { email: userEmail },
        });
      }

      if (!user) {
        // Create new user
        user = await prisma.user.create({
          data: {
            clerkId: clerkId || null,
            email: userEmail || null,
            name: userName || null,
          },
        });
        console.log("Created new user:", user);
      }

      finalUserId = user.id;
    }

    // Create new chat session
    const chatSession = await prisma.chatSession.create({
      data: {
        userId: finalUserId || null,
        lawyerId: lawyerId || null,
        status: "ACTIVE",
      },
      include: {
        user: true,
        lawyer: true,
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            userSender: true,
            lawyerSender: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      chatSession,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat session creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create chat session",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const lawyerId = searchParams.get("lawyerId");
    const sessionId = searchParams.get("sessionId");

    let chatSessions;

    if (sessionId) {
      // Get specific chat session
      chatSessions = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: {
          user: true,
          lawyer: true,
          messages: {
            orderBy: { createdAt: "asc" },
            include: {
              userSender: true,
              lawyerSender: true,
            },
          },
        },
      });
    } else if (userId) {
      // Get user's chat sessions
      chatSessions = await prisma.chatSession.findMany({
        where: { userId },
        include: {
          user: true,
          lawyer: true,
          messages: {
            orderBy: { createdAt: "asc" },
            include: {
              userSender: true,
              lawyerSender: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      });
    } else if (lawyerId) {
      // Get lawyer's chat sessions
      chatSessions = await prisma.chatSession.findMany({
        where: { lawyerId },
        include: {
          user: true,
          lawyer: true,
          messages: {
            orderBy: { createdAt: "asc" },
            include: {
              userSender: true,
              lawyerSender: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      });
    } else {
      return NextResponse.json(
        { success: false, error: "userId, lawyerId, or sessionId is required" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      chatSessions: sessionId ? [chatSessions].filter(Boolean) : chatSessions,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat session fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch chat sessions" },
      { status: 500 }
    );
  }
}
