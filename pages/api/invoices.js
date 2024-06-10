import { open } from "sqlite";
import sqlite3 from "sqlite3";

export default async function handler(req, res) {
  const { nifaSegur } = req.query; // Get the value of the nifaSegur query parameter
  const db = await open({
    filename: "./data/database/ITACAv1.db",
    driver: sqlite3.Database,
  });

  let rows = await db.all(
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

  // Add an ID property to each row
  rows = rows.map((row, index) => {
    return { id: index + 1, ...row };
  });

  res.status(200).json(rows);
}
