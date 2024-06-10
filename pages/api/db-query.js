import { ChatOpenAI } from "@langchain/openai";
import { DataSource } from "typeorm";
import { SqlDatabase } from "langchain/sql_db";
import { SqlDatabaseChain } from "langchain/chains/sql_db";
import { PromptTemplate } from "@langchain/core/prompts";

const template = `Given an input question, first create a syntactically correct {dialect} query to run, then look at the results of the query and return the answer.
Always answer in Spanish. If you don't know the answer, just say that you don't know, don't try to make up an answer.
Use the following format:

Question: "Question here"
SQLQuery: "SQL Query to run"
SQLResult: "Result of the SQLQuery"
Answer: "Final answer here"

Only use the following tables:

{table_info}

Question: {input}`;

const prompt = PromptTemplate.fromTemplate(template);

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

    if (firstMsg) {
      console.log("initializing chain");
      const datasource = new DataSource({
        type: "sqlite",
        database: "./data/database/ITACAv1.db",
      });

      const db = await SqlDatabase.fromDataSourceParams({
        appDataSource: datasource,
      });

      chain = new SqlDatabaseChain({
        llm: new ChatOpenAI({
          modelName: process.env["OPENAI_MODEL_3"],
          temperature: 0,
        }),
        database: db,
        sqlOutputKey: "sql",
        prompt,
      });
    }
    const query = "NIF " + nifparam + " " + question;

    /* Ask it a question */
    console.log(`Executing with input "${query}"...`);
    const response = await chain.call({ query });
    console.log("Result:", response);

    return res.status(200).json({ result: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}
