export type GetTokenFn = () => Promise<string | null>;

export async function getAuthorizationHeader(getToken: GetTokenFn) {
  const token = await getToken();

  if (!token) {
    throw new Error("Missing Clerk session token");
  }

  return `Bearer ${token}`;
}

export function getUserDisplayName(user: {
  username?: string | null;
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  primaryEmailAddress?: { emailAddress?: string | null } | null;
} | null | undefined) {
  return (
    user?.username ||
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "User"
  );
}
