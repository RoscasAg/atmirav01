// pages/api/populateGraph.js

import { Neo4jGraph } from "@langchain/community/graphs/neo4j_graph";
import { open } from "sqlite";
import sqlite3 from "sqlite3";

const url = process.env.NEO4J_URL;
const username = process.env.NEO4J_USERNAME;
const password = process.env.NEO4J_PASSWORD;

async function populateGraphDB_policies(rows) {
  const graph = await Neo4jGraph.initialize({ url, username, password });

  for (const row of rows) {
    try {
      // Create or find nodes and relationships based on the row data
      await graph.query(
        `
        MERGE (policy:Policy {policyNumber: $Policy})
        ON CREATE SET policy.product = $Product, policy.effectiveDate = $EffectiveDate, policy.expirationDate = $ExpirationDate
        MERGE (holder:Holder {name: $Holder, nif: $NIF})
        MERGE (agent:Agent {code: $Agent})
        MERGE (policy)-[:HELD_BY]->(holder)
        MERGE (policy)-[:MANAGED_BY]->(agent)
      `,
        {
          Product: row.Product,
          Policy: row.Policy,
          EffectiveDate: row.EffectiveDate,
          ExpirationDate: row.ExpirationDate,
          Holder: row.Holder,
          Agent: row.Agent,
          NIF: row.NIF,
        },
      );

      // Then, link the Holder to an existing Person node
      await graph.query(
        `
        MERGE (person:Person {nif: $NIF})
        WITH person
        MATCH (holder:Holder {nif: $NIF})
        MERGE (holder)-[:IDENTIFIED_AS]->(person)
      `,
        {
          NIF: row.NIF,
        },
      );
    } catch (error) {
      console.error("Failed to create nodes/relationships in Neo4j:", error);
      throw error; // Optionally re-throw to handle upstream
    }
  }
}

async function populateGraphDB_invoices(rows) {
  const graph = await Neo4jGraph.initialize({ url, username, password });

  try {
    for (const row of rows) {
      // Assuming 'receiptNumber' generation or default assignment is handled above
      const receiptNumber =
        row.Numrecibo ||
        (1000000 + Math.floor(Math.random() * 9000000)).toString();

      await graph.query(
        `
        // First, ensure the Policy node exists or create it if it doesn't
        MERGE (policy:Policy {policyNumber: $Poliza})
        ON CREATE SET
          policy.effectiveDate = $F_Efecto,
          policy.expirationDate = $F_Vencim

        // Then, merge the Invoice node
        MERGE (invoice:Invoice {receiptNumber: $receiptNumber})
        ON CREATE SET
          invoice.policyNumber = $Poliza,
          invoice.issueDate = $F_Emision,
          invoice.effectiveDate = $F_Efecto,
          invoice.expirationDate = $F_Vencim,
          invoice.totalAmount = $Imp_Total,
          invoice.accountNumber = $CCC,
          invoice.status = $Estado

        // Finally, create a relationship from Invoice to Policy
        MERGE (invoice)-[:HAS_INVOICED]->(policy)
      `,
        {
          Poliza: row.Poliza,
          receiptNumber: receiptNumber,
          F_Emision: row.F_Emision,
          F_Efecto: row.F_Efecto,
          F_Vencim: row.F_Vencim,
          Imp_Total: row.Imp_Total,
          CCC: row.CCC,
          Estado: row.Estado,
        },
      );
    }
  } catch (error) {
    console.error("Failed to create nodes/relationships in Neo4j:", error);
    throw error; // Optionally re-throw to handle upstream
  } finally {
    await graph.close(); // Always close the graph connection
  }
}

async function populateGraphDB_claims(rows) {
  const graph = await Neo4jGraph.initialize({ url, username, password });

  try {
    for (const row of rows) {
      // Create or update the Policy and Claim nodes and their relationship
      await graph.query(
        `
        // Ensure the Policy node exists
        MERGE (policy:Policy {policyNumber: $Poliza})

        // Merge the Claim node
        MERGE (claim:Claim {claimNumber: $Siniestro})
        ON CREATE SET
          claim.claimDate = $F_Siniestro,
          claim.cause = $Causa,
          claim.reason = $Motivo,
          claim.status = $Estado_Sin,
          claim.orderPaymentDate = $F_Orden_Pago,
          claim.totalPayment = $Imp_Total_Pago

        // Create a relationship from Claim to Policy
        MERGE (claim)-[:HAS_CLAIMED]->(policy)
      `,
        {
          Poliza: row.Poliza,
          Siniestro: row.Siniestro,
          F_Siniestro: row.F_Siniestro,
          Causa: row.Causa,
          Motivo: row.Motivo,
          Estado_Sin: row.Estado_Sin,
          F_Orden_Pago: row.F_Orden_Pago,
          Imp_Total_Pago: row.Imp_Total_Pago,
        },
      );
    }
  } catch (error) {
    console.error("Failed to create nodes/relationships in Neo4j:", error);
    throw error; // Optionally re-throw to handle upstream
  } finally {
    await graph.close(); // Always close the graph connection
  }
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { nifaSegur = "Z00000300" } = req.body;
    const db = await open({
      filename: "./data/database/ITACAv1.db",
      driver: sqlite3.Database,
    });

    try {
      let policies = await db.all(
        "SELECT Producto AS Product, Poliza AS Policy, Situacion AS Status, CodAgente AS Agent, NIFAsegur AS NIF, NomAsegurado AS Holder, FecEfecto AS EffectiveDate, FecVencim AS ExpirationDate, FecAnulac AS CancellationDate FROM Polizas WHERE NIFAsegur = ?",
        [nifaSegur],
      );

      policies = policies.map((row, index) => {
        return { id: index + 1, ...row };
      });

      let invoices = await db.all(
        `
      SELECT Poliza, F_Emision, Numrecibo, F_Efecto, F_Vencim, Imp_Total, CCC, Estado
      FROM recibos
      WHERE sseguro IN (
        SELECT sseguro
        FROM Polizas
        WHERE NIFAsegur = ?
      )
      `,
        [nifaSegur],
      );
      invoices = invoices.map((row, index) => {
        return { id: index + 1, ...row };
      });

      let claims = await db.all(
        `
      SELECT Poliza, Siniestro, F_Siniestro, Causa, Motivo, Estado_Sin, F_Orden_Pago, Imp_Total_Pago
      FROM siniestros
      WHERE sseguro IN (
        SELECT sseguro
        FROM Polizas
        WHERE NIFAsegur = ?
      )
      `,
        [nifaSegur],
      );

      // Add an ID property to each row
      claims = claims.map((row, index) => {
        return { id: index + 1, ...row };
      });

      // Now populate the graph database with the fetched rows
      await populateGraphDB_policies(policies);
      await populateGraphDB_invoices(invoices);
      await populateGraphDB_claims(claims);

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
