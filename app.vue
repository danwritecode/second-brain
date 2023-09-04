<template>
  <div>
    <NuxtPage/>

    <Noti />
  </div>
</template>

<script setup lang="ts">
import { Notification } from './models/noti';

const notiState = useState<Notification>('notiState')
notiState.value = {
  type: "success",
  title: "default",
  message: "default",
  showing: false
}
</script>
