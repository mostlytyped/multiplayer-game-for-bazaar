import RethinkID from "@mostlytyped/rethinkid-js-sdk";

export const rid = new RethinkID({
  appId: process.env.VUE_APP_APP_ID,
  loginRedirectUri: window.location.origin,
  // Enable local dev
  oAuthUri: "http://localhost:4444",
  dataApiUri: "http://localhost:4000",
  dataAPIConnectErrorCallback: function (e: any) {
    // this = RethinkID
    // @ts-ignore
    // this.logOut();
    console.log("Data API connect error", e);
  },
});
