import { PrismaClient } from '@prisma/client'
import type { brain_matter } from '@prisma/client'
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
  const searchValue = body.searchValue

  const embedding = await generateEmbedding(searchValue)
  const searchRes = await getEmbedding(embedding)
  console.log(searchRes)

  return searchRes
})

async function generateEmbedding(searchValue: string) {
  const embeddings = await openai.embeddings.create({
    input: searchValue,
    model: "text-embedding-ada-002"
  })

  const data = embeddings.data

  if (data.length === 0) {
    return []
  }

  return data[0].embedding
}

async function getEmbedding(embedding: number[]) {
  return await prisma.$queryRaw<brain_matter[]>`
    SELECT *
    FROM (
      SELECT id, body, embedding <-> ${embedding}::vector as "distance" 
      FROM brain_matter
    ) as I
    WHERE I.distance <= 0.7
    ORDER BY I.distance ASC
    LIMIT 5;
  `
}
