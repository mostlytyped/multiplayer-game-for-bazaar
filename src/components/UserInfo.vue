<template>
  <div v-if="email" class="user-info is-small-text">{{ email }} {{ id }}</div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { bzr } from "@/bzr";

export default defineComponent({
  name: "UserInfo",
  setup() {
    const email = ref("");
    const id = ref("");

    if (bzr.isLoggedIn()) {
      bzr.social.getUser().then((user) => {
        email.value = user.email || "";
        id.value = user.id;
      });
    }

    return { email, id };
  },
});
</script>

<style scoped lang="scss">
.user-info {
  position: fixed;
  top: 3px;
  right: 3px;
}
</style>
