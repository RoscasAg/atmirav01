import fs from 'fs';
import path from 'path';
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import "pdf-parse";
import { z } from "zod";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";

// Case # 2: Updated personSchema to extract main CV information
const industrySectors = z.enum([
  "Technology",
  "Finance",
  "Healthcare",
  "Insurance",
  "Retail",
  "Education",
  "Government",
  "Manufacturing",
  "Telecommunications",
  "Utilities",
  "Transportation",
  "RealEstate",
  "Hospitality",
  "Construction",
  "Public Administration",
  "Other", // Allows for any industry not covered by the list
]);

const industryExperienceSchema = z
  .object({
    industry: z.enum([
      "Technology",
      "Finance",
      "Healthcare",
      "Insurance",
      "Retail",
      "Education",
      "Government",
      "Manufacturing",
      "Telecommunications",
      "Utilities",
      "Transportation",
      "RealEstate",
      "Hospitality",
      "Construction",
      "Banking",
      "Public Administration",
      "Other",
    ]),
    otherDescription: z
      .string()
      .optional()
      .describe("Description for 'Other' industry sector"),
    description: z
      .string()
      .optional()
      .describe("Description of experience in the industry"),
    yearsOfExperience: z
      .number()
      .optional()
      .describe("Years of experience in the industry"),
  })
  .describe("Industry Experience");

const personSchema = z
  .object({
    employeid: z.string().optional().describe("The ID of the emloyee"),
    name: z.string().optional().describe("The name of the person"),
    email: z.string().optional().describe("Email address"),
    pdfURL: z.string().url().optional().describe("URL to the person's PDF CV"),
    phone: z.string().optional().describe("Phone number"),
    company: z
      .string()
      .optional()
      .describe("The company where the person currently works"),
    summary: z.string().optional().describe("A brief summary about the person"),
    professional_experience: z
      .array(
        z.object({
          position: z.string().describe("Position held"),
          company: z.string().describe("Company name"),
          dateStart: z.string().optional().describe("Start date of employment"),
          dateEnd: z.string().optional().describe("End date of employment"),
          client: z.string().optional().describe("Client name"),
          projects: z
            .array(
              z.object({
                name: z.string().describe("Project name"),
                description: z
                  .string()
                  .optional()
                  .describe("Project description"),
                technologies_tools: z
                  .array(z.string())
                  .optional()
                  .describe("Technologies and tools used"),
              }),
            )
            .optional()
            .describe("Projects involved"),
          responsibilities: z
            .array(z.string())
            .optional()
            .describe("List of responsibilities"),
          methodology: z
            .array(z.string())
            .optional()
            .describe("Methodologies followed"),
        }),
      )
      .optional()
      .describe("Professional experience"),
    education: z
      .array(
        z.object({
          degree: z.string().describe("The degree obtained"),
          institution: z.string().describe("The institution name"),
          year: z.string().optional().describe("Year of graduation"),
        }),
      )
      .optional()
      .describe("Educational background"),
    certifications: z
      .array(
        z.object({
          title: z.string().describe("Title of the certification"),
          institution: z.string().optional().describe("Certifying institution"),
          year: z.string().optional().describe("Year of certification"),
        }),
      )
      .optional()
      .describe("Professional certifications"),
    additional_training: z
      .array(
        z.object({
          title: z.string().describe("Title of the training"),
          details: z
            .string()
            .optional()
            .describe("Additional details about the training"),
        }),
      )
      .optional()
      .describe("Additional training"),
    languages: z
      .array(
        z.object({
          name: z.string().describe("Language name"),
          level: z.string().describe("Proficiency level"),
        }),
      )
      .optional()
      .describe("Language proficiencies"),
    skills: z
      .object({
        technical: z.array(z.string()).optional().describe("Technical skills"),
        soft: z.array(z.string()).optional().describe("Soft skills"),
      })
      .optional()
      .describe("Skills"),
    industry_experience: z
      .array(industryExperienceSchema)
      .optional()
      .describe("Experience across different industries"),
  })
  .describe("Comprehensive CV Information");

const peopleSchema = z.object({
  people: z.array(personSchema),
});

const SYSTEM_PROMPT_TEMPLATE_BASE = `You are an expert extraction algorithm.
Only extract relevant information from the text.
The industry experience should be calculated regarding the customer industry sector.
If you do not know the value of an attribute asked to extract, you may omit the attribute's value.
The next values should be inserted in the json output in the specific placeholders:
The pdfURL is {{pdfURL}} and the EmployeeId is {{EmployeeId}}.`;

export default async function handler(req, res) {
  if (req.method === "POST") {
    const directoryPath = req.body.directoryPath; // La ruta de la carpeta con los PDFs

    // Leer los nombres de todos los archivos en la carpeta
    fs.readdir(directoryPath, async (err, files) => {
      if (err) {
        console.log('Unable to scan directory: ' + err);
        return res.status(500).json({ message: "Unable to scan directory" });
      }

      // Filtrar para obtener solo archivos PDF
      const pdfFiles = files.filter(file => path.extname(file).toLowerCase() === '.pdf');

      // Procesar cada archivo PDF
      for (const file of pdfFiles) {
        const filePath = path.join(directoryPath, file);
        const response = await fetch(filePath);
        const blob = await response.blob();
        const loader = new PDFLoader(blob, { splitPages: false });
        const docs = await loader.load();

        if (docs.length === 0) {
          console.log("No documents found in file: " + file);
          continue;
        }

        const SYSTEM_PROMPT_TEMPLATE = SYSTEM_PROMPT_TEMPLATE_BASE.replace(
          "{{pdfURL}}",
          filePath,
        ).replace("{{EmployeeId}}", path.basename(file, '.pdf'));

        const prompt = ChatPromptTemplate.fromMessages([
          ["system", SYSTEM_PROMPT_TEMPLATE],
          ["human", "{text}"],
        ]);

        const llm = new ChatOpenAI({
          modelName: process.env["OPENAI_MODEL"],
          temperature: 0,
        });

        const extractionRunnable = prompt.pipe(
          llm.withStructuredOutput(peopleSchema, { name: "people" }),
        );

        const extract = await extractionRunnable.invoke({
          text: docs[0].pageContent,
        });

        console.log(JSON.stringify(extract, null, 2));
        console.log("Successfully extracted from file: " + file);
      }

      return res.status(200).json({
        result: `Information extracted from all PDFs`,
      });
    });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
