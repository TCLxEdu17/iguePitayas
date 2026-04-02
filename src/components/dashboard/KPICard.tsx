interface KPICardProps {
  label:     string
  value:     string | number
  icon:      string
  subtitle?: string
  positive?: boolean
}

export function KPICard({ label, value, icon, subtitle, positive }: KPICardProps) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p
            className="text-lg sm:text-2xl font-bold break-all"
            style={{ color: 'var(--color-primary)' }}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  )
}
