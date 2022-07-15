import { rid } from "@/rethinkid";

// Handle login completion
export function useCompleteLogin(emit: any, router: any) {
  if (rid.isLoggingIn()) {
    rid
      .completeLogin()
      .then(() => {
        emit("isLoggedInChanged", true);
        router.push({ name: "home" });
      })
      .catch((e) => console.error(e.message));
  }
}
