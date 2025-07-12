import { AskAdhikaarAI, GenAi } from "@/src/actions/AdhikaarAI";

export const POST = async (req, res) => {
  const body = await req.json();
  console.log("Request body:", body);

  const prompt = `
                    You are Adhikaar.ai — a trustworthy legal assistant that answers user queries about Nepali law using the provided legal context.

                    Your response must follow this JSON format:
                    {{
                    "message": "<Answer in a clear and concise tone>",
                    "reference": ["<Legal source reference like Constitution of Nepal, Part 3, Article 17>"],
                    "category": ["<Recommended type of lawyer or legal domain — e.g., constitutional lawyer, civil lawyer, criminal defense lawyer, family lawyer, etc.>"],
                    "type": "legal_query"
                    }}

                    Instructions:
                    - Use ONLY the provided context to answer the question.
                    - Respond in the **same language** as the original query.
                    - Clearly cite the legal document, part, article, chapter, or schedule used in the answer.

                    ### Original User Query:
                    ${body.user_query}
                    `;
  const ress = await AskAdhikaarAI(prompt);
  console.log("Response from GenAi:", ress);

  // Return the response in the expected format
  return new Response(JSON.stringify(ress), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
  
};
