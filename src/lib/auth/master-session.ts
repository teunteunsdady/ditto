export const AUTH_COOKIE_NAME = "master_session";
export const AUTH_COOKIE_VALUE = "authenticated";

export function isMasterSession(value: string | undefined) {
  return value === AUTH_COOKIE_VALUE;
}
