import { open } from "sqlite";
import sqlite3 from "sqlite3";

export default async function handler(req, res) {
  const { nifaSegur } = req.query; // Get the value of the nifaSegur query parameter
  const db = await open({
    filename: "./data/database/ITACAv1.db",
    driver: sqlite3.Database,
  });

  let rows = await db.all(
    "SELECT Producto AS Product, Poliza AS Policy, Situacion AS Status, CodAgente AS Agent, NIFAsegur AS NIF, NomAsegurado AS Holder, FecEfecto AS EffectiveDate, FecVencim AS ExpirationDate, FecAnulac AS CancellationDate FROM Polizas WHERE NIFAsegur = ?",
    [nifaSegur],
  );

  // Add an ID property to each row
  rows = rows.map((row, index) => {
    return { id: index + 1, ...row };
  });

  res.status(200).json(rows);
}
