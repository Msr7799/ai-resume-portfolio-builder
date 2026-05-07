import { createGoogleAuthRedirect, createGoogleOAuthState } from "@/lib/server/google-oauth";

export async function GET(request: Request) {
  return createGoogleAuthRedirect(request, createGoogleOAuthState());
}
