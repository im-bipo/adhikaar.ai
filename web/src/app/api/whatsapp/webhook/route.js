import { sendReply } from "@/lib/whapsApp";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  console.log("Received WhatsApp webhook verification request");
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  console.log("Received WhatsApp webhook verification request:", {
    mode,
    token,
    challenge,
  });

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log("WEBHOOK_VERIFIED");
    return new NextResponse(challenge, { status: 200 });
  } else {
    return new NextResponse("Unauthorized", { status: 403 });
  }
};

// --- POST method for Receiving Messages ---
export async function POST(request) {
  const body = await request.json();


  const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  const senderId = body?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.wa_id; // The sender's WhatsApp ID

  if (!message) {
    console.log("No message object found in webhook payload. Acknowledging.");
    return new NextResponse("OK", { status: 200 }); // Always respond with 200 OK to acknowledge receipt
  }


  if (message.type === "text") {
    const text = message.text.body;
    console.log("Received text:", text);

    try {
      const aiResponse = "Oee chup lag";
      console.log("AI Response:", aiResponse);

      await sendReply(senderId, aiResponse);
      console.log("Dummy reply sent for text message.");
    } catch (error) {
      console.error("Error getting or sending AI response:", error);
      await sendReply(
        senderId,
        "Sorry, I'm having trouble responding right now."
      );
    }
  }
  else {
    console.log(
      `Received unsupported message type: ${message.type}. Acknowledging.`
    );

    await sendReply(
      senderId,
      `I received a ${message.type} message. Currently, I only process text and audio.`
    );
  }

  return new NextResponse("OK", { status: 200 });
}
