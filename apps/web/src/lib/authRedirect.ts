export const PASSWORD_RECOVERY_PATH = "/update-password";

/**
 * Use the origin that the user is currently visiting so preview hosts do not
 * need to be embedded in the client bundle.
 */
export function getPasswordRecoveryRedirectUrl() {
  return new URL(PASSWORD_RECOVERY_PATH, window.location.origin).toString();
}
