import { LOCAL_STORAGE_NAME_MY_ID } from "./constants";

export function getMyId(): string {
  return localStorage.getItem(LOCAL_STORAGE_NAME_MY_ID) || "";
}
