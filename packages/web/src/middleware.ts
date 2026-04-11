import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/signin",
  },
});

// Protect all dashboard routes AND API routes (except auth endpoints, static, landing, docs)
export const config = {
  matcher: [
    "/((?!auth|api/auth|_next/static|_next/image|favicon\\.ico|docs$|$).*)",
  ],
};
