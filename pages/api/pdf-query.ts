import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { ChatOpenAI } from "@langchain/openai";
import { createRetrievalChain } from "langchain/chains/retrieval";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { BaseMessage } from "@langchain/core/messages";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";

const CUSTOM_QUESTION_GENERATOR_CHAIN_PROMPT = `Given the following conversation and a follow up question, return the conversation history excerpt that includes any relevant context to the question if it exists and rephrase the follow up question to be a standalone question.
Follow Up Input: {question}
Your answer should follow the following format:
\`\`\`
Use the following pieces of context to answer the users question. First of all look at the documents uploaded at the vector store and after that look at the chat history and see if there is any relevant context to the question. If there is, then rephrase the question to be a standalone question.
Always answer in Spanish. If you don't know the answer, just say that you don't know, don't try to make up an answer.
----------------
<Relevant chat history excerpt as context here>
Standalone question: <Rephrased question here>
\`\`\`
Your answer:`;

// Contextualize question
const contextualizeQSystemPrompt = `
Given a chat history and the latest user question
which might reference context in the chat history,
formulate a standalone question which can be understood
without the chat history. Do NOT answer the question, just
reformulate it if needed and otherwise return it as is.`;

// Answer question
const qaSystemPrompt = `
You are an assistant for question-answering tasks. Use
the following pieces of retrieved context to answer the
question. If you don't know the answer, just say that you
don't know. Use three sentences maximum and keep the answer
concise.
\n\n
{context}`;

let chain;

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      throw new Error("Method not allowed");
    }

    // Grab the user prompt
    let { question, nifparam, firstMsg } = req.body;

    if (!question) {
      throw new Error("No input");
    }

    if (!nifparam) {
      nifparam = "Z00000300"; // Set the 'nifparam' variable to 'Z00000300' if it doesn't exist in the request body
    }

    const pinecone = new Pinecone();

    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);
    const namespace = nifparam;
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings(),
      { pineconeIndex, namespace, filter: { NIF: { $eq: nifparam } } },
    );
    const retriever = vectorStore.asRetriever();
    const llm = new ChatOpenAI({
      modelName: process.env["OPENAI_MODEL"],
      temperature: 0,
    });
    const contextualizeQPrompt = ChatPromptTemplate.fromMessages([
      ["system", contextualizeQSystemPrompt],
      new MessagesPlaceholder("chat_history"),
      ["human", "{input}"],
    ]);
    const historyAwareRetriever = await createHistoryAwareRetriever({
      llm,
      retriever,
      rephrasePrompt: contextualizeQPrompt,
    });
    const qaPrompt = ChatPromptTemplate.fromMessages([
      ["system", qaSystemPrompt],
      new MessagesPlaceholder("chat_history"),
      ["human", "{input}"],
    ]);
    // Below we use createStuffDocuments_chain to feed all retrieved context
    // into the LLM. Note that we can also use StuffDocumentsChain and other
    // instances of BaseCombineDocumentsChain.
    const questionAnswerChain = await createStuffDocumentsChain({
      llm,
      prompt: qaPrompt,
    });

    const ragChain = await createRetrievalChain({
      retriever: historyAwareRetriever,
      combineDocsChain: questionAnswerChain,
    });
    // Usage:
    const chat_history: BaseMessage[] = [];
    const response = await ragChain.invoke({
      chat_history,
      input: question,
    });

    //console.log(JSON.stringify(response.answer, null, 2));

    return res.status(200).json({ result: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}
