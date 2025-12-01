// client/src/components/reports/DashboardStats.jsx
// ============================================
import { Card, CardContent } from '../ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const DashboardStats = ({ title, value, subtitle, trend, icon: Icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'border-l-blue-500 bg-blue-50',
    green: 'border-l-green-500 bg-green-50',
    orange: 'border-l-orange-500 bg-orange-50',
    red: 'border-l-red-500 bg-red-50',
    purple: 'border-l-purple-500 bg-purple-50'
  };

  const getTrendIcon = () => {
    if (!trend) return <Minus className="h-4 w-4" />;
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  return (
    <Card className={`border-l-4 ${colorClasses[color]} hover:shadow-lg transition-shadow`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
            {trend !== undefined && (
              <div className="flex items-center gap-1 mt-2">
                {getTrendIcon()}
                <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {trend > 0 ? '+' : ''}{trend}%
                </span>
              </div>
            )}
          </div>
          {Icon && <Icon className={`h-12 w-12 text-${color}-500 opacity-80`} />}
        </div>
      </CardContent>
    </Card>
  );
};