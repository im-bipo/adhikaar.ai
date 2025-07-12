"use server";
import { GoogleGenAI } from "@google/genai";

import { Pinecone } from "@pinecone-database/pinecone";
import { HfInference } from "@huggingface/inference";

// Initialize Pinecone
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

const index = pc.index("legal-chatbot-index");

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

const AskAdhikaarAI = async (prompt) => {
  const context = await getEmbeddings(prompt);
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
