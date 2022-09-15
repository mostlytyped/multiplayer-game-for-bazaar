<template>
  <div v-if="popUpLoginCompleteMsg">{{ popUpLoginCompleteMsg }}</div>
  <template v-else>
    <div>
      <button @click="login" class="button">Commence space exploration</button>
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

    // At least on Brave iOS closing a pop-up fails.
    // The pop-up staying open is confusing, so at least
    // show a message explaining login succeeded and the window
    // can be closed
    let popUpLoginCompleteMsg = ref("");

    // After login callback
    rid.onLogin = () => {
      emit("isLoggedInChanged", true);
      router.push({ name: "home" });
    };

    function login() {
      rid.login();
      // rid.login({ type: "popup_fallback" });
      // rid.login({ type: "redirect" });
      // rid.login({ type: "popup" });
    }

    return { login, popUpLoginCompleteMsg };
  },
});
</script>

<style scoped lang="scss"></style>
