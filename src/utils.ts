import { rid } from "@/rethinkid";

export function getMyId(): string {
  const me = rid.userInfo();
  return me && me.id ? me.id : "";
}
