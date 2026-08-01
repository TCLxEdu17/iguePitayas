export function VersionBadge() {
  return (
    <div className="fixed bottom-20 right-3 text-[10px] text-gray-400 select-none md:bottom-2 z-50">
      v{process.env.NEXT_PUBLIC_APP_VERSION}
    </div>
  )
}
