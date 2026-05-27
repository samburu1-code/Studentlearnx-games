'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';

function EmbedWrapperContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const [isEmbed, setIsEmbed] = useState(false);

  useEffect(() => {
    // Trigger embed mode if explicitly flagged OR if a student identity was
    // handed in via the URL (from the parent site)
    const embedFlag = searchParams.get('embed') === 'true';
    const hasStudent = !!searchParams.get('student_email');
    if (embedFlag || hasStudent) {
      sessionStorage.setItem('slx_embed', 'true');
      setIsEmbed(true);
    } else if (sessionStorage.getItem('slx_embed') === 'true') {
      setIsEmbed(true);
    }
  }, [searchParams]);

  if (isEmbed) {
    return <main>{children}</main>;
  }

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}

export default function EmbedWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<main>{children}</main>}>
      <EmbedWrapperContent>{children}</EmbedWrapperContent>
    </Suspense>
  );
}
