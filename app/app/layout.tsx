import type { Metadata } from "next"
import { ProtectedRoute } from '@/components/ProtectedRoute'

export const metadata: Metadata = {
  title: "Broq - Visual Flow Builder",
  description: "Build and run AI flows visually",
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  )
} 