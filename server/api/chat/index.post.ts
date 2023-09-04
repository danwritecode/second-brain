import OpenAI from 'openai';

const config = useRuntimeConfig()

const openai = new OpenAI({
  apiKey: config.OPENAI_API_TOKEN
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const searchResults = body.searchResults
  const prompt = body.prompt
  const chatRes = await chatCompletion(searchResults, prompt)

  if (!chatRes) {
    throw createError({ statusCode: 500, statusMessage: "Something went wrong when generating the chat completion", fatal: true})
  }

  return chatRes
})

async function chatCompletion(searchResults: string[], prompt: string) {
  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system", 
        content: `
          You are acting as a expert knowledgebase system that is excellent at taking in context and helping users find answers.

          I am going to provide you with two things: 
          1. SEARCH RESULTS: the user has a vector DB in which they are searching, the response of this search is being included as context for you
          2. USER PROMPT: the prompt that the user actually wants you to act upon

          There will be a separator between the "SEARCH RESULTS" and the "USER PROMPT", don't mix them up.
        `
      },
      {
        role: "user", 
        content: `
          SEARCH RESULTS: ${searchResults}

          ---------------------------------

          USER PROMPT: ${prompt}
        `
      }
    ]
  });

  const message = chatCompletion.choices[0].message

  if (!message || !message.content) {
    return 
  }

  return message.content
}
