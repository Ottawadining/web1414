import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default function Login() {
  return (
    <div className="wrap narrow">
      <PageHeader
        kicker="Reservations"
        title="Sign in"
        intro="One tap with your Google account. You need to be signed in to vote, comment or nominate a critic."
      />
      <LoginForm />
    </div>
  );
}
