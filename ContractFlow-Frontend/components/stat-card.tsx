interface StatCardProps {
  title: string
  value: string
  icon: string
  color: string
  iconBg: string
}

export default function StatCard({ title, value, icon, color, iconBg }: StatCardProps) {
  return (
    <div className={`${color} rounded-2xl p-6 flex items-center justify-between`}>
      <div>
        <p className="text-muted-foreground text-sm mb-2">{title}</p>
        <p className="text-3xl font-bold text-foreground">{value}</p>
      </div>
      <div className={`${iconBg} w-16 h-16 rounded-full flex items-center justify-center text-2xl text-white`}>
        {icon}
      </div>
    </div>
  )
}
