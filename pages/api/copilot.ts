import type { NextApiRequest, NextApiResponse } from "next";

import { CopilotRuntime, OpenAIAdapter } from "@copilotkit/backend";
import { Action } from "@copilotkit/shared";
import { researchWithLangGraph } from "./research_2";
import { researchActionPDFHandler } from "./researchActionPDFHandler";
import { researchActionDBHandler } from "./researchActionDBHandler";

const researchAction: Action<any> = {
  name: "research",
  description:
    "Call this function to conduct research on a certain topic. Respect other notes about when to call this function",
  parameters: [
    {
      name: "topic",
      type: "string",
      description: "The topic to research. 5 characters or longer.",
    },
  ],
  handler: async ({ topic }) => {
    return await researchWithLangGraph(topic);
  },
};

const researchActionPDF: Action<any> = {
  name: "pdfsearch",
  description:
    "Call this function to look information about an insurance policy located in a document",
  parameters: [
    {
      name: "topic",
      type: "string",
      description: "The query to search.",
    },
    {
      name: "nifparam",
      type: "string",
      description: "The nif of the user.",
    },
  ],
  handler: async ({ topic, nifparam }) => {
    return await researchActionPDFHandler({ topic, nifparam });
  },
};

const researchActionData: Action<any> = {
  name: "datasearch",
  description:
    "Call this function to look for information about products, policies, invoices or claims stored in a database",
  parameters: [
    {
      name: "topic",
      type: "string",
      description: "The query to search.",
    },
    {
      name: "nifparam",
      type: "string",
      description: "The nif of the user.",
    },
  ],
  handler: async ({ topic, nifparam }) => {
    return await researchActionDBHandler({ topic, nifparam });
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const actions: Action<any>[] = [];
  if (
    process.env["TAVILY_API_KEY"] &&
    process.env["TAVILY_API_KEY"] !== "NONE"
  ) {
    actions.push(researchAction);
    actions.push(researchActionPDF);
    actions.push(researchActionData);
  }
  const copilotKit = new CopilotRuntime({
    actions: actions,
  });

  const openaiModel = process.env["OPENAI_MODEL"];

  copilotKit.streamHttpServerResponse(
    req,
    res,
    new OpenAIAdapter({ model: openaiModel }),
  );
}
