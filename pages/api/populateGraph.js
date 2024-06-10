// pages/api/populateGraph.js

import { Neo4jGraph } from "@langchain/community/graphs/neo4j_graph";
import { OpenAI } from "@langchain/openai";

const url = process.env.NEO4J_URL;
const username = process.env.NEO4J_USERNAME;
const password = process.env.NEO4J_PASSWORD;

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { people } = req.body;
    if (!people) {
      return res.status(400).json({ error: "No people data provided" });
    }

    try {
      // Initialize the graph connection
      const graph = await Neo4jGraph.initialize({ url, username, password });

      // Initialize the OpenAI model
      const model = new OpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: process.env["OPENAI_MODEL"],
        temperature: 0,
      });

      // Cypher query to create/update graph entities
      const query_create_4 = `
        MERGE (p:Person {employeid: $employeid})
        ON CREATE SET p.name = $name, p.company = $company
        WITH p
        UNWIND $languages AS lang
        MERGE (l:Language {name: lang.name})
        ON CREATE SET l.name = lang.name
        MERGE (p)-[:SPEAKS {level: lang.level}]->(l)
        WITH p
        UNWIND $certifications AS cert
        MERGE (c:Certification {title: cert.title})
        ON CREATE SET c.year = cert.year, c.title = cert.title
        MERGE (p)-[:HAS_CERTIFICATION]->(c)
        WITH p
        UNWIND $professionalExperience AS pe
        MERGE (exp:Experience {position: pe.position, company: pe.company, client: pe.client})
        MERGE (p)-[:HAS_EXPERIENCE]->(exp)
        WITH p
        UNWIND $education AS edu
        MERGE (e:Education {degree: edu.degree, institution: edu.institution})
        ON CREATE SET e.year = edu.year
        MERGE (p)-[:HAS_EDUCATION]->(e)
        WITH p
        UNWIND $skills.technical AS skill
        MERGE (s:Skill {name: skill})
        MERGE (p)-[:HAS_SKILL]->(s)
        WITH p
        UNWIND $industryExperience AS ie
        MERGE (ind:IndustryExperience {industry: ie.industry})
        ON CREATE SET ind.description = ie.description, ind.yearsOfExperience = ie.yearsOfExperience
        MERGE (p)-[:HAS_INDUSTRY_EXPERIENCE]->(ind)
      `;

      for (const person of people) {
        person.professional_experience = person.professional_experience.map(
          (experience) => {
            if (!experience.client) {
              return { ...experience, client: "Unknown Client" };
            }
            return experience;
          },
        );

        await graph.query(query_create_4, {
          name: person.name,
          employeid: person.employeid,
          company: person.company || "none",
          languages: person.languages,
          certifications:
            person.certifications && person.certifications.length > 0
              ? person.certifications
              : [{ title: "Default Certification", year: "N/A" }],
          professionalExperience: person.professional_experience,
          education: person.education,
          skills: { technical: person.skills.technical },
          industryExperience:
            person.industry_experience && person.industry_experience.length > 0
              ? person.industry_experience
              : [
                  {
                    industry: "General",
                    description: "N/A",
                    yearsOfExperience: 0,
                  },
                ],
        });
        console.log(
          `Person ${person.name} and relationships created successfully`,
        );
      }

      await graph.refreshSchema();
      res.status(200).json({ message: "Graph populated successfully" });
    } catch (error) {
      console.error("Error populating graph:", error);
      res
        .status(500)
        .json({ error: "Failed to populate graph", details: error.toString() });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
