import { rid } from "@/rethinkid";

// Handle login completion
// emit: any, router: any
export function useCompleteLogin() {
  if (rid.isLoggingIn()) {
    // redirect login
    // rid
    //   .completeLogin()
    //   .then(() => {
    //     emit("isLoggedInChanged", true);
    //     router.push({ name: "home" });
    //   })
    //   .catch((e) => console.error(e.message));

    rid
      .completePopUpLogin()
      .then(() => {
        console.log(
          "isLoggedIn, complete pop-up login. Should catch message in parent window"
        );
      })
      .catch((e) => console.error(e.message));
  }
}
