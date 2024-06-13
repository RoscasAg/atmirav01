import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { Pinecone } from "@pinecone-database/pinecone";
import { Document } from "langchain/document";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export default async function handler(req, res) {
  if (req.method === "POST") {
    let { pdfpath, nifparam, docname } = req.body;
    console.log(`Uploading book: ${pdfpath}`);

    if (!nifparam) {
      nifparam = "Z00000300"; // Set the 'nifparam' variable to 'Z00000300' if it doesn't exist in the request body
    }

    if (!docname) {
      docname = "general";
    }

    /** STEP ONE: LOAD DOCUMENT */
    const response = await fetch(pdfpath);
    const blob = await response.blob();
    const loader = new PDFLoader(blob);
    const docs = await loader.load();

    if (docs.length === 0) {
      console.log("No documents found.");
      return;
    }

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splitDocs = await splitter.splitDocuments(docs);

    // Add the NIF as a metada for futher filtering
    const reducedDocs = splitDocs.map((doc, index) => {
      const reducedMetadata = { ...doc.metadata };
      reducedMetadata.NIF = nifparam; // Add a new 'NIF' property with the value of 'Z00000300'
      reducedMetadata.Type = "PDF"; // Add a new 'Type' property with the value of 'PDF'
      reducedMetadata.PDFPath = pdfpath; // Add a new 'PDFPath' property with the value of the original PDF path
      reducedMetadata.Id = `${docname}#${index + 1}`; // Add a new 'Id' property formatted as 'docname#number'
      delete reducedMetadata.pdf; // Remove the 'pdf' field

      return new Document({
        pageContent: doc.pageContent,
        metadata: reducedMetadata,
      });
    });

    //console.log(docs[100]);
    //console.log(splitDocs[100].metadata);
    //console.log(reducedDocs[100].metadata);

    /** STEP TWO: UPLOAD TO DATABASE */
    const pc = new Pinecone();

    let pineconeIndex; // Declare pineconeIndex outside to make it accessible outside the blocks

    try {
      await pc.createIndex({
        name: process.env.PINECONE_INDEX,
        dimension: 1536,
        metric: "cosine",
        spec: {
          serverless: {
            cloud: "aws",
            region: "us-east-1",
          },
        },
      });
      pineconeIndex = pc.Index(process.env.PINECONE_INDEX); // Assign the value to pineconeIndex
    } catch (error) {
      pineconeIndex = pc.Index(process.env.PINECONE_INDEX); // Assign the value to pineconeIndex in case of an error
    }

    const namespace = nifparam;

    await PineconeStore.fromDocuments(reducedDocs, new OpenAIEmbeddings(), {
      pineconeIndex,
      namespace,
    });

    console.log("Successfully uploaded to DB");
    // Modify output as needed
    return res.status(200).json({
      result: `Uploaded to Pinecone! Before splitting: ${docs.length}, After splitting: ${splitDocs.length}`,
    });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
