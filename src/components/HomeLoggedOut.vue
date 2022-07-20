<template>
  <div v-if="popUpLoginCompleteMsg">{{ popUpLoginCompleteMsg }}</div>
  <div v-else-if="!loginUri">Loading...</div>
  <template v-else>
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

    // At least on Brave iOS closing a pop-up fails.
    // The pop-up staying open is confusing, so at least
    // show a message explaining login succeeded and the window
    // can be closed
    let popUpLoginCompleteMsg = ref("");

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
    rid
      .completeLogin()
      .then((response) => {
        popUpLoginCompleteMsg.value = response;
      })
      .catch((e: any) => console.error(e.message));

    function openLoginPopUp(event: Event) {
      rid.openLoginPopUp(loginUri.value, event);
    }

    return { loginUri, popUpLoginCompleteMsg, openLoginPopUp };
  },
});
</script>

<style scoped lang="scss"></style>
