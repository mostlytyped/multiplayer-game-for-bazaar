import RethinkID from "@mostlytyped/rethinkid-js-sdk";

const config = {
  appId: process.env.VUE_APP_APP_ID,
  loginRedirectUri: window.location.origin,
  dataAPIConnectErrorCallback: function (e: any) {
    // this = RethinkID
    // @ts-ignore
    // this.logOut();
    console.log("Data API connect error", e);
  },
};

export const rid = new RethinkID(config);
