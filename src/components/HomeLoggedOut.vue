<template>
  <a class="button" :href="loginUri">Commence space exploration</a>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import { useCompleteLogin } from "@/composables/complete-login";
import { rid } from "@/rethinkid";

export default defineComponent({
  name: "HomeLoggedOut",
  setup(props, { emit }) {
    const router = useRouter();

    let loginUri = ref("");

    rid
      .loginUri()
      .then((uri) => (loginUri.value = uri))
      .catch((e) => console.error(e.message));

    useCompleteLogin(emit, router);

    return { loginUri };
  },
});
</script>

<style scoped lang="scss"></style>
