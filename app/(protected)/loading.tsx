import Loader from "@/components/Loader";

// The full-screen loader, shown only while the signed-in app (the dashboard)
// loads. It used to sit at app/loading.tsx, which flashed a white page before
// every public page too: the landing page, sign-in, sign-up and pay links.
export default function Loading() {
  return <Loader />;
}
