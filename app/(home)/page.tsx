import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Landing } from "@/components/landing/Landing";

export const metadata: Metadata = {
  title: "VergePay | Built for Nigeria's freelancers and small businesses",
  description:
    "Personal and business wallets, invoices your clients pay in one tap, and a live picture of where every naira goes. Built for Nigeria's freelancers and small businesses.",
  openGraph: {
    title: "VergePay | Built for Nigeria's freelancers and small businesses",
    description: "Personal and business wallets, invoices clients pay in one tap, and live insights. Built for freelancers and small businesses.",
    siteName: "VergePay",
    type: "website",
  },
};

// The public home page (vergepay.com). Signed-in visitors get a way back to
// their dashboard instead of the sign-up buttons.
export default async function Home() {
  const jar = await cookies();
  const signedIn = jar.has("access_token") || jar.has("refresh_token");
  return <Landing signedIn={signedIn} />;
}
