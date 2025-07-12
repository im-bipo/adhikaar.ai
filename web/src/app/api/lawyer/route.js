import { prisma } from "@/lib/prisma";

export async function POST(request) {
  const body = await request.json();
  console.log("Received lawyer data:", body);

  const {
    userId,
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
    JSON.stringify({ message: "Lawyer created successfully" }),
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
    const lawyers = await prisma.lawyer.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

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
