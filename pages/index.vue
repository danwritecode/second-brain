<template>
  <StdContainer>
    <div class="md:flex md:items-center md:justify-between">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">Dan's Second Brain</h2>
      </div>
      <div class="mt-4 flex md:ml-4 md:mt-0">
        <NuxtLink to="/new-embedding" type="button" class="ml-3 inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">New embedding</NuxtLink>
      </div>
    </div>

    <div class="mt-16 grid grid-cols-2 divide-x divide-solid">
      <div class="pr-6">
        <div class="pb-5">
          <h3 class="text-base font-semibold leading-6 text-gray-900">Search</h3>
          <p class="mt-2 max-w-4xl text-sm text-gray-500">Search for any topic in your second brain with natural language. We'll generate embeddings for your search and use it to search.</p>
        </div>
        <div>
          <div>
            <label for="search" class="block text-sm font-medium leading-6 text-gray-600">Search inquiry here</label>
            <div class="mt-2">
              <textarea 
                v-model="searchText"
                @keyup.enter="search()"
                rows="4" 
                name="search" 
                id="search" 
                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-hover" 
                placeholder="natural language search with text embeddings"
              >
              </textarea>
            </div>
            <SubmitButton 
              class="mt-2"
              @click="search()"
              submit-text="Search"
              color="blue"
              size="md"
              :submit-loading="searchLoading"
              submit-loading-text="Searching"
              :is-valid-state="searchText !== ''"
              :full-width="false"
            /> 
          </div>
        </div>

        <div v-if="searchResponse" class="mt-6">
          <ul class="space-y-3">
            <li v-for="r in searchResponse" :key="r.id">
              <div class="flex items-center space-x-3 rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm">
                <p class="text-gray-600 text-sm">{{ r.body }}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div class="pl-6">
        <div class="pb-5"> 
          <h3 class="text-base font-semibold leading-6 text-gray-900">Chat with your second brain</h3> 
          <p class="mt-2 max-w-4xl text-sm text-gray-500">Chat with gpt-4. We'll take your initial inquiry, generate vector embeddings and use that to get second brain context. Then we'll inject that context into a new chat with gpt-4.</p>
        </div>
        <div>
          <div>
            <div class="mt-2">
              <label for="search" class="block text-sm font-medium leading-6 text-gray-600">Search inquiry here</label>
              <textarea 
                v-model="searchPromptText"
                rows="4" 
                name="search" 
                id="search" 
                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-hover" 
                placeholder="natural language search with text embeddings"
              >
              </textarea>
            </div>
            <div class="mt-2">
              <label for="search" class="block text-sm font-medium leading-6 text-gray-600">Prompt text</label>
              <textarea 
                v-model="promptText"
                @keyup.enter="search()"
                rows="4" 
                name="search" 
                id="search" 
                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-hover" 
                placeholder="natural language search with text embeddings"
              >
              </textarea>
            </div>
            <SubmitButton 
              class="mt-2"
              @click="chat()"
              submit-text="Chat"
              color="blue"
              size="md"
              :submit-loading="chatLoading"
              submit-loading-text="Generating response"
              :is-valid-state="searchPromptText !== '' && promptText !== ''"
              :full-width="false"
            /> 
          </div>

          <div class="mt-12">
            {{ chatResponse }}
          </div>
        </div>

      </div>
    </div> 
  </StdContainer>
</template>

<script setup lang="ts">
import type { brain_matter } from "@prisma/client"

const searchText = ref("")
const searchLoading = ref(false)
const searchResponse = ref<brain_matter[] | null>()

async function search() {
  searchLoading.value = true
  const searchRes = await executeSearch(searchText.value)
  searchResponse.value = searchRes
  searchLoading.value = false
}

async function executeSearch(text: string) {
  const { data, error } = await useFetch("/api/search", {
    method: "POST",
    body: {
      searchValue: text
    }
  }) 


  if (error.value) {
    console.error(error.value)
    useNoti("error", "Uh oh", "An error occured when searching, please try again later", true)
    return
  }

  if (!data.value) {
    useNoti("error", "Uh oh", "An error occured when chatting, please try again later", true)
    return 
  }

  searchText.value = ""
  return data.value
}

const searchPromptText = ref("")
const promptText = ref("")
const chatLoading = ref(false)
const chatResponse = ref<string[]>([])

async function chat() {
  chatLoading.value = true
  const searchRes = await executeSearch(searchPromptText.value)

  console.log(searchRes)

  if (!searchRes) {
    useNoti("error", "Uh oh", "An error occured when chatting, please try again later", true)
    return
  }

  const searchResList = searchRes.map(s => s.body)
  console.log(searchResList)

  const chatRes = await executeChat(searchResList)

  if (!chatRes) {
    useNoti("error", "Uh oh", "An error occured when chatting, please try again later", true)
    return
  }

  chatResponse.value.push(chatRes)
  chatLoading.value = false
}


async function executeChat(searchResults: string[]) {
  const { data, error } = await useFetch("/api/chat", {
    method: "POST",
    body: {
      searchResults: searchResults,
      prompt: promptText.value
    }
  }) 

  if (error.value) {
    console.error(error.value)
    useNoti("error", "Uh oh", "An error occured when chatting, please try again later", true)
    return
  }

  if (!data.value) {
    useNoti("error", "Uh oh", "An error occured when chatting, please try again later", true)
    return 
  }

  return data.value
}
</script>
