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

      // Give the new player read permissions to the game doc in the games table
      permissions.push({
        tableName: GAMES_TABLE_NAME,
        userId: newPlayerId.value,
        type: "read",
        condition: {
          rowId: gameId,
        },
      });

      // Give the new player read permissions to the whole players table
      permissions.push({
        tableName: usePlayersTableName(gameId),
        userId: newPlayerId.value,
        type: "read",
      });

      // Give the new player all other permission types only to their player doc in the players table
      const myPlayerDocPermissionTypes: PermissionType[] = [
        "insert",
        "update",
        "delete",
      ];
      for (const type of myPlayerDocPermissionTypes) {
        permissions.push({
          tableName: usePlayersTableName(gameId),
          userId: newPlayerId.value,
          type,
          condition: {
            matchUserId: "id",
          },
        });
      }

      rid
        .permissionsSet(permissions)
        .then(() => {
          useGetTeam(gameId);
        })
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
