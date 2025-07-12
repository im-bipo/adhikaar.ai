import { prisma } from "@/lib/prisma";

export async function POST(request) {
  const body = await request.json();
  console.log("Received lawyer data:", body);

  const {
    userId,
    clerkId,
    name,
    email,
    barId,
    specialty,
    description,
    profilePicture,
    city,
    state,
    country,
    phoneNumber,
  } = body;

  const newLawyer = await prisma.lawyer.create({
    data: {
      id: userId,
      clerkId: clerkId,
      name,
      email,
      barId,
      specialty,
      description,
      profilePicture,
      city,
      state,
      country,
      phoneNumber,
    },
  });
  console.log("New Lawyer Created:", newLawyer);

  return new Response(
    JSON.stringify({
      message: "Lawyer created successfully",
      lawyer: newLawyer,
    }),
    {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clerkId = searchParams.get("clerkId");

    let lawyers;

    if (clerkId) {
      // Get specific lawyer by Clerk ID
      lawyers = await prisma.lawyer.findMany({
        where: { clerkId: clerkId },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      // Get all lawyers
      lawyers = await prisma.lawyer.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: lawyers.length,
        lawyers: lawyers,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching lawyers:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch lawyers",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
