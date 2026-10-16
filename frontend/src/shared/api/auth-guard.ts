import { sessionStorageApi } from "./session";

export function hasSession() {
  const guestCompleto = Boolean(
    sessionStorageApi.getGuestUserId() && sessionStorageApi.getGuestToken()
  );

  return guestCompleto || Boolean(sessionStorageApi.getAccessToken());
}
