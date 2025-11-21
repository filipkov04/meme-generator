'use client';

import { db } from '@/lib/db';

export default function InstantDBProvider({ children }: { children: React.ReactNode }) {
  // InstantDB automatically provides context through db.useAuth() and db.useQuery()
  // This component is a placeholder for any future provider setup
  return <>{children}</>;
}

