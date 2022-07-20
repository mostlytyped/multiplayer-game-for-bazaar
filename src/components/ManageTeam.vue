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
import { rid } from "@/rethinkid";
import { useTeam, useGetTeam } from "@/composables/team";
import { getGameTableName, getPlayersTableName } from "@/utils";
import { useGetStringFromParam } from "@/composables/router-params";

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

      /**
       * id: string; // if updating
       * tableName: string;
       * userId: string;
       * type: 'read', 'insert', 'update', 'delete';
       */
      const permissions: Permission[] = [];
      const permissionTypes: PermissionType[] = [
        "read",
        "insert",
        "update",
        "delete",
      ];

      // Giving everyone added all permissions for the games and players tables for convenience.

      // Adding to game table, not game doc
      for (const type of permissionTypes) {
        permissions.push({
          tableName: getGameTableName(gameId),
          userId: newPlayerId.value,
          type,
        });
      }

      // Adding to players table, not player doc
      for (const type of permissionTypes) {
        permissions.push({
          tableName: getPlayersTableName(gameId),
          userId: newPlayerId.value,
          type,
        });
      }

      rid
        .permissionsSet(permissions)
        .then(() => useGetTeam(gameId)) // need to fetch, haven't got permission ID to add, not returned by API
        .catch((e) => console.error(e.message))
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
