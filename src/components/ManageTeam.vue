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
import { rid, usePlayersTableName } from "@/rethinkid";
import { useTeam, useGetTeam } from "@/composables/team";
import { useGetStringFromParam } from "@/composables/router-params";
import { GAMES_TABLE_NAME } from "@/constants";

import {
  Permission,
  PermissionType,
} from "@mostlytyped/rethinkid-js-sdk/dist/types/types";

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

      addToTeamText.value = "Adding...";

      const permissions: Permission[] = [];

      // Give all players all permissions to players table, because need to update
      // other players when stuck together
      const myPlayerDocPermissionTypes: PermissionType[] = [
        "read",
        "insert",
        "update",
        "delete",
      ];
      for (const type of myPlayerDocPermissionTypes) {
        permissions.push({
          tableName: GAMES_TABLE_NAME,
          userId: newPlayerId.value,
          type,
          condition: {
            rowId: gameId,
          },
        });
      }
      for (const type of myPlayerDocPermissionTypes) {
        permissions.push({
          tableName: usePlayersTableName(gameId),
          userId: newPlayerId.value,
          type,
        });
      }

      rid
        .permissionsSet(permissions)
        .then(() => {
          useGetTeam(gameId);
        })
        .catch((e: any) => console.error(e.message))
        .finally(() => {
          addToTeamText.value = addToTeamTextInitial;
          newPlayerId.value = "";
        });
    }

    return { addToTeam, newPlayerId, addToTeamText, useTeam };
  },
});
</script>

<style scoped lang="scss"></style>
