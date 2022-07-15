<template>
  <div class="home">
    <div>
      <HomeLoggedIn v-if="isLoggedIn" />
      <HomeLoggedOut v-else @is-logged-in-changed="setIsLoggedIn" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import HomeLoggedIn from "@/components/HomeLoggedIn.vue";
import HomeLoggedOut from "@/components/HomeLoggedOut.vue";

import { rid } from "@/rethinkid";

export default defineComponent({
  name: "HomeView",
  components: {
    HomeLoggedIn,
    HomeLoggedOut,
  },
  setup() {
    const isLoggedIn = ref(rid.isLoggedIn());

    function setIsLoggedIn(state: boolean) {
      isLoggedIn.value = state;
    }

    return { isLoggedIn, setIsLoggedIn };
  },
});
</script>

<style lang="scss">
.home {
  display: flex;
  align-items: center;
  justify-content: space-around;

  height: 100vh;
  padding: 1em;
}
</style>
