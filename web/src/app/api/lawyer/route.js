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
