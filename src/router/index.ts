import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";
import GameView from "../views/GameView.vue";
// import GameBView from "../views/GameBView.vue";
import { bzr } from "@/bzr";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: HomeView,
    meta: { requiresAuth: false },
  },
  {
    path: "/:userId/:gameId",
    name: "game",
    component: GameView,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  // If route requires auth
  if (to.matched.some((record) => record.meta.requiresAuth !== false)) {
    if (!bzr.isLoggedIn()) {
      // Redirect to the sign in view if no token found and route requires auth
      next({ name: "home" });
      return;
    }
  }

  next();
});

export default router;
