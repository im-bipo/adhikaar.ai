"use server";

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

export { getEmbeddings };
