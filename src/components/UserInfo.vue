<template>
  <div v-if="email" class="user-info is-small-text">{{ email }} {{ id }}</div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { rid } from "@/rethinkid";

export default defineComponent({
  name: "UserInfo",
  setup() {
    const email = ref("");
    const id = ref("");

    if (rid.isLoggedIn()) {
      const me = rid.userInfo();
      if (me?.email) email.value = me.email;
      if (me?.id) id.value = me.id;
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
