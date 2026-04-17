import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `[data-navbar],[data-footer]{display:none!important}main{padding:0!important}`
        }}
      />
      {children}
    </>
  );
}
