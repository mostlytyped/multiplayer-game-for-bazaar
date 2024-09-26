<template>
  <div class="card">
    <p>2. Ask player to send their ID and add to your team</p>
    <p class="is-small-text">Team members can join any of your games.</p>
    <form @submit.prevent="addToTeam">
      <input
        type="text"
        class="input"
        v-model="newPlayerId"
        placeholder="e.g. 5d76b11b-d0ed-4520-b451-2748c195bea5"
        spellcheck="false"
        required
      />
      <button class="button is-small-text" type="submit">
        {{ addToTeamText }}
      </button>
    </form>

    <div class="team">
      <div>{{ useTeam }}</div>
      <p>Team members ({{ useTeam.length }})</p>
      <div v-for="t in useTeam" :key="t.id">
        {{ t.userId }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useRoute } from "vue-router";
import { useTeam, useGetTeam } from "@/composables/team";
import { useGetStringFromParam } from "@/composables/router-params";
import { useGamesCollection } from "@/bzr";

export default defineComponent({
  name: "ManageTeam",
  setup() {
    const route = useRoute();

    const newPlayerId = ref("");
    const addToTeamTextInitial = "Add player to team";
    const addToTeamText = ref(addToTeamTextInitial);

    const gameId = useGetStringFromParam(route.params.gameId);

    useGetTeam(gameId);

    function addToTeam() {
      // Do not re-add team member
      if (useTeam.value.some((t: any) => t.userId === newPlayerId.value)) {
        addToTeamText.value = "Already a team member!";
        setTimeout(() => {
          addToTeamText.value = addToTeamTextInitial;
          newPlayerId.value = "";
        }, 1000);
        return;
      }

      useTeam.value.push(newPlayerId.value);

      addToTeamText.value = "Adding...";

      // const permissions: Permission[] = [];

      // Add player ID to game doc on field "teamIds"
      useGamesCollection()
        .updateOne(gameId, { id: gameId, teamIds: useTeam.value })
        .then(() => console.log("update: added team member"))
        .catch((e: any) => console.error(e.message));

      // Create permission to match game doc on field "teamIds" on game table create

      // Give all players all permissions to players table, because need to update
      // other players when stuck together
      // const permissionTypes: PermissionType[] = [
      //   "read",
      //   "insert",
      //   "update",
      //   "delete",
      // ];

      // for (const type of permissionTypes) {
      //   permissions.push({
      //     tableName: usePlayersCollectionName(gameId),
      //     userId: newPlayerId.value,
      //     type,
      //   });
      // }

      // bzr
      //   .permissionsSet(permissions)
      //   .then(() => {
      //     useGetTeam(gameId);
      //   })
      //   .catch((e: any) => console.error(e.message))
      //   .finally(() => {
      //     addToTeamText.value = addToTeamTextInitial;
      //     newPlayerId.value = "";
      //   });
    }

    return { addToTeam, newPlayerId, addToTeamText, useTeam };
  },
});
</script>

<style scoped lang="scss"></style>
