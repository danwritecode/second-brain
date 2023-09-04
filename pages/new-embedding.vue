<template>
  <NarrowContainer>
    <div>
      <label for="embedding" class="block text-sm font-medium leading-6 text-gray-600">Paste embedding text here</label>
      <div class="mt-2">
        <textarea 
          v-model="embeddingText"
          rows="4" 
          name="embedding" 
          id="embedding" 
          class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-hover" 
          placeholder="Some text that you want to generate embeddings for..."
        >
        </textarea>
      </div> 
      <SubmitButton class="mt-2"
        @click="generateEmbedding()"
        submit-text="Generate embedding"
        color="blue"
        size="md"
        :submit-loading="genEmbeddingLoading"
        submit-loading-text="Generating"
        :is-valid-state="embeddingText !== ''"
        :full-width="false"
      /> 
    </div>
  </NarrowContainer>
</template>

<script setup lang="ts">

const embeddingText = ref("")
const genEmbeddingLoading = ref(false)

async function generateEmbedding() {
  genEmbeddingLoading.value = true

  const { error } = await useFetch("/api/embeddings", {
    method: "POST",
    body: {
      embeddingText: embeddingText.value
    }
  }) 

  genEmbeddingLoading.value = false

  if (error.value) {
    console.error(error.value)
    useNoti("error", "Uh oh", "An error occured when generating embeddings, please try again later", true)
    return
  }

  embeddingText.value = ""
  useNoti("success", "Success", "Successfully generated embeddings", true)
}
</script>
