function StatsCard({ title, value, icon, color = 'blue' }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
    pink: 'from-pink-500 to-pink-600'
  };

  const textColors = {
    blue: 'text-blue-100',
    green: 'text-green-100',
    purple: 'text-purple-100',
    orange: 'text-orange-100',
    red: 'text-red-100',
    pink: 'text-pink-100'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} text-white rounded-lg p-6 shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`${textColors[color]} text-sm mb-1`}>{title}</p>
          <h3 className="text-3xl font-bold">{value}</h3>
        </div>
        {icon && <div className="text-5xl opacity-50">{icon}</div>}
      </div>
    </div>
  );
}

export default StatsCard;