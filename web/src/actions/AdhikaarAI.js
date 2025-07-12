"use server";
import { GoogleGenAI } from "@google/genai";

import { Pinecone } from "@pinecone-database/pinecone";
import { HfInference } from "@huggingface/inference";

// Initialize Pinecone
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

const index = pc.index(process.env.PINECONE_INDEX_NAME);

const getEmbeddings = async (query) => {
  // query the Pinecone index for embeddings
  try {
    const embedding = await hf.featureExtraction({
      model: "intfloat/e5-small-v2",
      inputs: query,
    });

    const results = await index.query({
      vector: Array.from(embedding),
      topK: 10,
      includeMetadata: true,
    });
    console.log("Embedding results:", results);
    return results.matches;
  } catch (error) {
    console.error("Error fetching embeddings:", error);
    throw error;
  }
};

const GenAi = async (prompt) => {
  const ai = new GoogleGenAI({});

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  return response.text;
};

const AskAdhikaarAI = async (query) => {
  const context = await getEmbeddings(query);

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
                    ${query}

                    ### Context: ${JSON.stringify(context)}
                    `;

  const response = await GenAi(
    prompt + "\n\nContext: " + JSON.stringify(context)
  );
  console.log("AI Response:", response);

  //try to parse the response as JSON if it is not in JSON format ask genai to give a valid json of that response
  try {
    let cleanedString = response.replace(/^```json\s*|\s*```$/g, "").trim();
    console.log("Cleaned String:", cleanedString);
    const jsonResponse = JSON.parse(cleanedString);
    return jsonResponse;
  } catch (error) {
    try {
      console.error("Response is not valid JSON, asking GenAI to correct it.");
      const correctedResponse = await GenAi(
        `The following response is not valid JSON: ${response}. Please provide a valid JSON response in the format specified in the prompt. and also remove '''json  '''`
      );
      console.log("Corrected Response:", correctedResponse);
      return correctedResponse;
    } catch (error) {
      console.error("Response is not valid JSON, asking GenAI to correct it.");
      const correctedResponse = await GenAi(
        `The following response is not valid JSON: ${response}. Please provide a valid JSON response in the format specified in the prompt. and also remove '''json  '''`
      );
      console.log("Corrected Response:", correctedResponse);
      return correctedResponse;
    }
  }
};

export { GenAi, AskAdhikaarAI };
