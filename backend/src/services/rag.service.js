import fs from 'fs';
import crypto from 'crypto';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import prisma from "../prisma/client.js";
import { decrypt } from "../utils/encryption.js";
import { RAG_CONFIG } from "../config/constants.js";

// Parse PDF using Langchain's PDFLoader (FS version for Node.js)
const parsePdf = async (buffer) => {
    try {
        console.log('🔍 Initializing Langchain PDF Loader (Stable)...');

        // Use Blob with the standard FS loader which is more stable in Node
        const blob = new Blob([buffer]);
        const loader = new PDFLoader(blob, {
            splitPages: false // Keep text as one block for simpler processing
        });

        console.log('📖 Loading and parsing PDF text...');
        const docs = await loader.load();

        const fullText = docs.map(doc => doc.pageContent).join('\n\n');

        if (!fullText || fullText.trim().length === 0) {
            throw new Error("No text content could be extracted from this PDF.");
        }

        console.log(`✅ PDF parsed successfully, extracted ${fullText.length} characters`);

        return {
            text: fullText,
            numPages: docs.length
        };
    } catch (error) {
        console.error('❌ PDF parsing error:', error.message);
        throw new Error(`PDF parsing failed: ${error.message}`);
    }
};

class RAGService {
    async getEmbeddingsModel(userId, provider) {
        const apiKeyRecord = await prisma.apiKey.findUnique({
            where: { userId_provider: { userId, provider } }
        });

        if (!apiKeyRecord) throw new Error(`API Key for ${provider} not found for embeddings.`);
        const decryptedKey = decrypt(apiKeyRecord.encryptedKey);

        if (provider.toLowerCase() === 'openai') {
            return new OpenAIEmbeddings({ openAIApiKey: decryptedKey });
        } else if (provider.toLowerCase() === 'gemini') {
            return new GoogleGenerativeAIEmbeddings({
                apiKey: decryptedKey,
                modelName: "text-embedding-004" // Dedicated embedding model
            });
        }
        throw new Error("Unsupported provider for embeddings");
    }

    async processDocument(filePath, fileName, fileType, agentId, userId) {
        console.log('📄 Processing document:', { fileName, fileType, agentId });

        let text = "";

        try {
            if (fileType.includes('pdf')) {
                console.log('📖 Processing PDF file...');
                const dataBuffer = fs.readFileSync(filePath);

                try {
                    const data = await parsePdf(dataBuffer);
                    text = data.text;
                    if (!text || text.trim().length === 0) {
                        throw new Error('PDF appears to be empty or contains no extractable text');
                    }
                } catch (pdfErr) {
                    console.error('❌ PDF Parse Error:', pdfErr);
                    throw new Error(`PDF parsing failed: ${pdfErr.message}`);
                }
            } else {
                console.log('📝 Processing text file...');
                text = fs.readFileSync(filePath, 'utf8');
            }

            if (!text || text.trim().length === 0) {
                throw new Error('Document is empty or contains no text');
            }

            const splitter = new RecursiveCharacterTextSplitter({
                chunkSize: RAG_CONFIG.CHUNK_SIZE,
                chunkOverlap: RAG_CONFIG.CHUNK_OVERLAP,
            });
            const docs = await splitter.createDocuments([text]);
            const chunks = docs.map(d => d.pageContent);

            const [agent, documentRecord] = await Promise.all([
                prisma.agent.findUnique({ where: { id: agentId } }),
                prisma.document.create({
                    data: { agentId, fileName, fileType }
                })
            ]);

            if (!agent) throw new Error(`Agent not found: ${agentId}`);

            const embeddingsModel = await this.getEmbeddingsModel(userId, agent.modelProvider);

            console.log(`📡 Generating embeddings for ${chunks.length} chunks...`);
            const embeddings = await embeddingsModel.embedDocuments(chunks);

            console.log('💾 Saving chunks to database...');
            const batchSize = 50;
            for (let i = 0; i < chunks.length; i += batchSize) {
                const batchChunks = chunks.slice(i, i + batchSize);
                const batchEmbeddings = embeddings.slice(i, i + batchSize);

                await Promise.all(batchChunks.map((content, idx) => {
                    const vectorString = `[${batchEmbeddings[idx].join(',')}]`;
                    return prisma.$executeRaw`
                        INSERT INTO "Embedding" (id, "documentId", content, embedding)
                        VALUES (${crypto.randomUUID()}, ${documentRecord.id}, ${content}, ${vectorString}::vector)
                    `;
                }));
            }

            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            return documentRecord;
        } catch (error) {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            throw error;
        }
    }

    async searchSimilar(agentId, query, userId, limit = 8) {
        try {
            const agent = await prisma.agent.findUnique({ where: { id: agentId } });
            if (!agent) throw new Error("Agent not found");

            const embeddingsModel = await this.getEmbeddingsModel(userId, agent.modelProvider);
            const queryEmbedding = await embeddingsModel.embedQuery(query);
            const vectorString = `[${queryEmbedding.join(',')}]`;

            // Use configurable similarity threshold
            const results = await prisma.$queryRaw`
                SELECT content, 1 - (embedding <=> ${vectorString}::vector) as similarity
                FROM "Embedding"
                JOIN "Document" ON "Embedding"."documentId" = "Document".id
                WHERE "Document"."agentId" = ${agentId}
                AND 1 - (embedding <=> ${vectorString}::vector) > ${RAG_CONFIG.SIMILARITY_THRESHOLD}
                ORDER BY similarity DESC
                LIMIT ${limit}
            `;

            console.log(`🔍 RAG Search for agent ${agentId}: found ${results.length} relevant chunks`);
            return results;
        } catch (error) {
            console.error('❌ RAG Search error:', error);
            throw new Error(`Failed to search documents: ${error.message}`);
        }
    }
}

export default new RAGService();
