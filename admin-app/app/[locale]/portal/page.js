"use client";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PortalRoot() {
  const router = useRouter();
  useEffect(() => { router.replace('/portal/business'); }, [router]);
  return null;
}
