import { useRoute } from "vue-router";
import { computed } from "vue";
import { getMyId } from "@/utils";

export const useAmGameCreator = computed(
  () => useRoute().params.userId === getMyId()
);
