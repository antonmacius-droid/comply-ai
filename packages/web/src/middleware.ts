import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/signin",
  },
});

// Protect all dashboard routes and API routes (except auth)
export const config = {
  matcher: [
    "/((?!auth|api/auth|_next|favicon|docs|$).*)",
  ],
};
