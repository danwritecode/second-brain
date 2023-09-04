import { PrismaClient } from '@prisma/client'
import OpenAI from 'openai';

const config = useRuntimeConfig()

const openai = new OpenAI({
  apiKey: config.OPENAI_API_TOKEN
});

// needed for prisma
(BigInt.prototype as any).toJSON = function () {
  return Number(this)
};

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const embeddingText = body.embeddingText

  const embedding = await generateEmbedding(embeddingText)
  let rowsAffected = await saveEmbedding(embeddingText, embedding)

  if (rowsAffected === 0) {
    throw createError({ statusCode: 500, statusMessage: "Failed to save embeddings to pgvector/db"})
  }

  return event.node.res.end()
})

async function generateEmbedding(embeddingText: string) {
  const embeddings = await openai.embeddings.create({
    input: embeddingText,
    model: "text-embedding-ada-002"
  })

  const data = embeddings.data

  if (data.length === 0) {
    return []
  }

  return data[0].embedding
}

async function saveEmbedding(body: string, embedding: number[]) {
  return await prisma.$executeRaw`INSERT INTO brain_matter (body, embedding) VALUES (${body}, ${embedding});`
}
