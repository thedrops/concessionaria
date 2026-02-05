import { ReactNode, Suspense } from "react";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import CustomScripts from "@/components/public/CustomScripts";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <CustomScripts position="HEAD" />
      </Suspense>
      <Suspense fallback={null}>
        <CustomScripts position="BODY_START" />
      </Suspense>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <Suspense fallback={null}>
        <CustomScripts position="BODY_END" />
      </Suspense>
    </>
  );
}
