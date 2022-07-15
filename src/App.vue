<template>
  <router-view />
  <UserInfo />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import UserInfo from "@/components/UserInfo.vue";

export default defineComponent({
  name: "GameView",
  components: {
    UserInfo,
  },
});
</script>
<style lang="scss">
@import "~normalize.css/normalize.css";

// Pixelated typeface
@import url("https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap");

:root {
  --small-font-size: 0.7em;
}

// apply a natural box layout model to all elements, but allowing components to change
html {
  box-sizing: border-box;
}
*,
*:before,
*:after {
  box-sizing: inherit;
}

html {
  background-color: #000;
}

body {
  color: yellow;
  font-family: "Press Start 2P", cursive;

  height: 100vh;
  width: 100vw;
}

.nav {
  position: fixed;
  bottom: 3px;
  right: 3px;
  display: flex;
  gap: 3px;
  opacity: 0.5;
}

.card {
  border: 5px solid yellow;
  margin: 1em 0;
  padding: 1em;
}

.button {
  color: yellow;
  cursor: pointer;
  outline: 0;
  background-color: green;
  border-color: green;
  display: inline-block;
  font-weight: 400;
  line-height: 1.5;
  text-align: center;
  border: 1px solid transparent;
  padding: 6px 12px;
  font-size: 16px;
  text-decoration: none;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}
.button:hover {
  color: green;
  background-color: yellow;
  border-color: yellow;
}

.input {
  background-color: #333;
  border-color: yellow;
  color: white;
  box-shadow: inset 0 0.0625em 0.125em var(--light-gray);
  margin-bottom: 0.5em;
  max-width: 100%;
  padding: 3px;
  width: 100%;
}

.is-small-text {
  font-size: var(--small-font-size);
}

.is-semi-transparent {
  opacity: 0.5;
}

.list-reset {
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
