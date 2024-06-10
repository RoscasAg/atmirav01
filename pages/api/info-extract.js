import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import "pdf-parse";
import { z } from "zod";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";

// Case # 2: Updated personSchema to extract main CV information
const policySchemaObj = z
  .object({
    policyNumber: z.string().describe("Policy number"),
    insurer: z
      .object({
        name: z.string().describe("Name of the insurance company"),
        address: z.string().describe("Address of the insurance company"),
        contactInfo: z
          .object({
            phone: z.string().describe("Phone number"),
            fax: z.string().describe("Fax number"),
            email: z.string().email().describe("Email address"),
            website: z
              .string()
              .regex(
                /^(?:http[s]?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#\[\]@!$&'()*+,;=]+$/,
              )
              .describe("Website URL"),
          })
          .describe("Contact information of the insurer"),
      })
      .describe("Insurer details"),
    policyHolder: z
      .object({
        name: z.string().describe("Name of the policy holder"),
        address: z.string().describe("Address of the policy holder"),
        effectiveDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .describe("Effective date of the policy"),
        expirationDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .describe("Expiration date of the policy"),
      })
      .describe("Policy holder details"),
    vehicle: z
      .object({
        makeAndModel: z.string().describe("Make and model of the vehicle"),
        registrationNumber: z.string().describe("Vehicle registration number"),
        usage: z.string().describe("Usage type of the vehicle"),
        firstRegistrationDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .describe("First registration date of the vehicle"),
      })
      .describe("Vehicle details"),
    coverage: z
      .array(
        z.object({
          type: z.string().describe("Type of coverage"),
          description: z
            .string()
            .optional()
            .describe("Description of the coverage"),
          limits: z.string().optional().describe("Limits or amounts covered"),
        }),
      )
      .describe("List of coverages"),
    premiums: z
      .object({
        netPremium: z.number().describe("Net premium amount"),
        taxes: z.number().describe("Taxes on the premium"),
        totalPremium: z.number().describe("Total premium amount"),
        paymentMethod: z.string().describe("Method of payment"),
        bankAccount: z
          .string()
          .optional()
          .describe("Bank account for direct debit"),
      })
      .describe("Premium details"),
    endorsements: z
      .array(z.string())
      .optional()
      .describe("Endorsements or special conditions"),
    clauses: z.array(z.string()).optional().describe("Clauses and exclusions"),
  })
  .describe("Comprehensive Policy Information");

const policySchema = z.object({
  people: z.array(policySchemaObj),
});

const SYSTEM_PROMPT_TEMPLATE_BASE = `You are an expert extraction algorithm.
Only extract relevant information from the text.
If you do not know the value of an attribute asked to extract, you may omit the attribute's value.`;

export default async function handler(req, res) {
  if (req.method === "POST") {
    let { pdfpath, nifparam, docname } = req.body;

    /** STEP ONE: LOAD DOCUMENT */
    const response = await fetch(pdfpath);
    const blob = await response.blob();
    const loader = new PDFLoader(blob, {
      splitPages: false,
    });
    const docs = await loader.load();

    if (docs.length === 0) {
      console.log("No documents found.");
      return;
    }

    //const SYSTEM_PROMPT_TEMPLATE = `${SYSTEM_PROMPT_TEMPLATE_BASE}"${pdfpath}".`;
    // Replace the placeholders with actual values
    //const SYSTEM_PROMPT_TEMPLATE = SYSTEM_PROMPT_TEMPLATE_BASE.replace(
    //  "{{pdfURL}}",
    //  pdfpath
    //);
    const SYSTEM_PROMPT_TEMPLATE = SYSTEM_PROMPT_TEMPLATE_BASE;

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", SYSTEM_PROMPT_TEMPLATE],
      ["human", "{text}"],
    ]);

    const llm = new ChatOpenAI({
      modelName: process.env["OPENAI_MODEL"],
      temperature: 0,
    });

    //const llm = new ChatMistralAI({
    //  modelName: "mistral-large-latest",
    //  temperature: 0,
    //});

    const extractionRunnable = prompt.pipe(
      llm.withStructuredOutput(policySchema, { name: "people" }),
    );

    const extract = await extractionRunnable.invoke({
      text: docs[0].pageContent,
    });

    console.log(JSON.stringify(extract, null, 2));
    console.log("Successfully extracted");

    // Modify output as needed
    return res.status(200).json({
      result: `Information extracted`,
    });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
