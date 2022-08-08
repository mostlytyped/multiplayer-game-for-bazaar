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
    rid.onLoginCallback = () => {
      emit("isLoggedInChanged", true);
      router.push({ name: "home" });
    };

    // Complete login
    rid
      .completeLogin()
      .then((response) => {
        if (response === "popup") {
          popUpLoginCompleteMsg.value =
            "Login successful. This tab can now be closed";
          return;
        }
      })
      .catch((e: any) => console.error(e.message));

    function login() {
      rid.login({
        type: "redirect",
      });
    }

    return { login, popUpLoginCompleteMsg };
  },
});
</script>

<style scoped lang="scss"></style>
