<template>
  <div>
    <a class="button" :href="redirectLoginUri"
      >Commence space exploration (redirect)</a
    >
  </div>
  <div>
    <button class="button" @click="openLoginPopUp">
      Commence space exploration (pop-up)
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import { useCompleteLogin } from "@/composables/complete-login";
import { rid } from "@/rethinkid";

export default defineComponent({
  name: "HomeLoggedOut",
  emits: ["isLoggedInChanged"],
  setup(props, { emit }) {
    const router = useRouter();

    let redirectLoginUri = ref("");

    function openLoginPopUp() {
      rid.openLoginPopUp(() => {
        console.log(
          "received pop up login complete message event, set logged in true, push to home"
        );
        emit("isLoggedInChanged", true);
        router.push({ name: "home" });
      });
    }

    rid
      .loginUri()
      .then((uri) => (redirectLoginUri.value = uri))
      .catch((e) => console.error(e.message));

    useCompleteLogin();

    return { redirectLoginUri, openLoginPopUp };
  },
});
</script>

<style scoped lang="scss"></style>
