<template>
  <div v-if="!loginUri">Loading...</div>
  <template v-else>
    <div>
      <a class="button" :href="loginUri"
        >Commence space exploration (redirect)</a
      >
    </div>
    <div>
      <a class="button" :href="loginUri" @click="openLoginPopUp"
        >Commence space exploration (redirect/pop-up)</a
      >
    </div>
  </template>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import { rid } from "@/rethinkid";

export default defineComponent({
  name: "HomeLoggedOut",
  emits: ["isLoggedInChanged"],
  setup(props, { emit }) {
    const router = useRouter();

    let loginUri = ref("");

    // After login callback
    const afterLoginCallback = () => {
      emit("isLoggedInChanged", true);
      router.push({ name: "home" });
    };

    // Get the login URI
    rid
      .loginUri(afterLoginCallback)
      .then((uri: string) => (loginUri.value = uri))
      .catch((e: any) => console.error(e.message));

    // Complete login
    rid.completeLogin().catch((e: any) => console.error(e.message));

    function openLoginPopUp(event: Event) {
      rid.openLoginPopUp(loginUri.value, event);
    }

    return { loginUri, openLoginPopUp };
  },
});
</script>

<style scoped lang="scss"></style>
