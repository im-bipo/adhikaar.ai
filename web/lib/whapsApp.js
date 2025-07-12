// src/utils/whatsappApi.js
import fetch from "node-fetch";

// Ensure environment variables are loaded (e.g., via dotenv.config() in your main server file or next.config.js)
// In Next.js, process.env variables are automatically available in API routes.

// It's better to pass recipientPhone dynamically if you want to send to different users
// and use the WHATSAPP_PHONE_NUMBER_ID from env for the API URL.
const WHATSAPP_API_BASE_URL = "https://graph.facebook.com/v22.0";

/**
 * Sends a WhatsApp message to a specified recipient.
 * @param {string} recipientPhone - The phone number of the recipient (e.g., "9779867418196").
 * @param {string} message - The text message to send.
 * @returns {Promise<object>} The API response data.
 * @throws {Error} If WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID is not set, or API call fails.
 */
export const sendReply = async (recipientPhone, message) => {
  if (!process.env.WHATSAPP_TOKEN) {
    throw new Error("WHATSAPP_TOKEN is not set in environment variables.");
  }
  if (!process.env.WHATSAPP_PHONE_NUMBER_ID) {
    throw new Error(
      "WHATSAPP_PHONE_NUMBER_ID is not set in environment variables."
    );
  }

  // Input validation
  if (
    typeof recipientPhone !== "string" ||
    recipientPhone.trim().length === 0
  ) {
    throw new Error("Recipient phone number must be a non-empty string.");
  }
  if (typeof message !== "string" || message.trim().length === 0) {
    throw new Error("Message must be a non-empty string.");
  }

  const trimmedMessage = message.trim();
  const apiUrl = `${WHATSAPP_API_BASE_URL}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: recipientPhone,
        type: "text",
        text: { body: trimmedMessage },
      }),
      // Node.js fetch doesn't have a direct 'timeout' option like some other clients.
      // For a real production app, consider using 'AbortController' for timeouts.
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("WhatsApp API Error Response:", data);
      throw new Error(
        `WhatsApp API error: ${data.error?.message || "Unknown error"}`
      );
    }

    return data;
  } catch (error) {
    // Note: 'ECONNABORTED' is a Node.js specific error code for network timeouts
    // with some HTTP clients, but 'fetch' API itself doesn't expose it directly.
    // For fetch, you'd typically handle AbortController errors for timeouts.
    console.error("Error in sendReply:", error);
    throw new Error(`Failed to send WhatsApp message: ${error.message}`);
  }
};
