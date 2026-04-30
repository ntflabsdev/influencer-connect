'use client';

import React from 'react';

// ── Soft Blue Color Palette ──
export const softBlueColors = {
  primary: '#3b82f6',      // Soft Blue 500
  primaryLight: '#dbeafe',  // Blue 100
  primaryDark: '#1d4ed8',   // Blue 700
  secondary: '#6366f1',     // Soft Indigo 500
  secondaryLight: '#e0e7ff', // Indigo 100
  accent: '#06b6d4',        // Soft Cyan 500
  accentLight: '#cffafe',   // Cyan 100
  success: '#10b981',       // Emerald 500
  successLight: '#d1fae5',  // Emerald 100
  warning: '#f59e0b',       // Amber 500
  warningLight: '#fef3c7',  // Amber 100
  danger: '#ef4444',        // Red 500
  dangerLight: '#fee2e2',   // Red 100
  neutral: '#6b7280',       // Gray 500
  neutralLight: '#f3f4f6'   // Gray 100
};

// ── Soft Blue Gradients ──
export const softBlueGradients = {
  primary: 'from-blue-400 via-blue-500 to-cyan-500',
  secondary: 'from-indigo-400 via-blue-500 to-cyan-400',
  accent: 'from-cyan-400 via-blue-500 to-indigo-400',
  success: 'from-emerald-400 via-cyan-500 to-blue-400',
  gentle: 'from-blue-100 via-cyan-100 to-indigo-100',
  warm: 'from-amber-100 via-blue-100 to-cyan-100'
};

// ── Gradient Card Component ──
export const GradientCard = ({ children, gradient = softBlueGradients.primary, padding = 'p-6', rounded = 'rounded-2xl', className = '' }) => (
  <div className={`bg-gradient-to-br ${gradient} ${padding} ${rounded} ${className}`}>
    {children}
  </div>
);

// ── Glass Card Component ──
export const GlassCard = ({ children, padding = 'p-6', rounded = 'rounded-2xl', className = '' }) => (
  <div className={`bg-white/10 backdrop-blur-sm border border-white/20 ${padding} ${rounded} ${className}`}>
    {children}
  </div>
);

// ── Modern Stat Card ──
export const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend = null,
  accent = softBlueColors.primary, 
  accentBg = softBlueColors.primaryLight,
  className = ''
}) => (
  <div className={`bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow ${className}`}>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mb-1">{value ?? 0}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
            trend.value > 0 ? 'text-emerald-600' : trend.value < 0 ? 'text-red-400' : 'text-gray-500'
          }`}>
            <span>{trend.value > 0 ? '↑' : trend.value < 0 ? '↓' : '→'}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: accentBg, color: accent }}
      >
        {icon}
      </div>
    </div>
  </div>
);

// ── Activity Feed Item ──
export const ActivityItem = ({ icon, title, description, time, type = 'default' }) => {
  const typeStyles = {
    success: 'bg-green-50 text-green-600 border-green-200',
    warning: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    error: 'bg-red-50 text-red-600 border-red-200',
    info: 'bg-blue-50 text-blue-600 border-blue-200',
    default: 'bg-gray-50 text-gray-600 border-gray-200'
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${typeStyles[type]}`}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-600 mt-1">{description}</p>
        <p className="text-xs text-gray-500 mt-2">{time}</p>
      </div>
    </div>
  );
};

// ── Progress Ring ──
export const ProgressRing = ({ value = 0, size = 120, strokeWidth = 8, color = '#4f46e5' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{value}%</span>
      </div>
    </div>
  );
};

// ── Feature Pill ──
export const FeaturePill = ({ icon, text, className = '' }) => (
  <div className={`flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20 ${className}`}>
    <span className="text-xl">{icon}</span>
    <span className="text-white/85 text-sm font-medium">{text}</span>
  </div>
);

// ── Metric Row ──
export const MetricRow = ({ label, value, color = 'text-indigo-600', bg = 'bg-indigo-50' }) => (
  <div className={`flex items-center justify-between p-3 rounded-xl ${bg}`}>
    <span className="text-sm text-gray-700">{label}</span>
    <span className={`text-sm font-semibold ${color}`}>{value}</span>
  </div>
);

// ── Chart Placeholder ──
export const ChartPlaceholder = ({ title, height = 200 }) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-6">
    <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>
    <div 
      className="flex items-center justify-center rounded-xl bg-gray-50 border-2 border-dashed border-gray-200"
      style={{ height: `${height}px` }}
    >
      <div className="text-center">
        <div className="text-4xl mb-2">📊</div>
        <p className="text-sm text-gray-500">Chart data will appear here</p>
      </div>
    </div>
  </div>
);

// ── Quick Action Button ──
export const QuickAction = ({ icon, label, onClick, color = 'blue' }) => {
  const colorStyles = {
    blue: 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200',
    cyan: 'bg-cyan-50 hover:bg-cyan-100 text-cyan-600 border-cyan-200',
    emerald: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-50 hover:bg-amber-100 text-amber-600 border-amber-200',
    rose: 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200',
    indigo: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border-indigo-200'
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${colorStyles[color]}`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};

// ── Status Indicator ──
export const StatusIndicator = ({ status, label }) => {
  const statusStyles = {
    online: 'bg-green-100 text-green-700 border-green-200',
    offline: 'bg-gray-100 text-gray-700 border-gray-200',
    busy: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    away: 'bg-orange-100 text-orange-700 border-orange-200'
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium ${statusStyles[status]}`}>
      <div className={`w-2 h-2 rounded-full ${
        status === 'online' ? 'bg-green-500' : 
        status === 'offline' ? 'bg-gray-500' : 
        status === 'busy' ? 'bg-yellow-500' : 'bg-orange-500'
      }`} />
      {label}
    </div>
  );
};
