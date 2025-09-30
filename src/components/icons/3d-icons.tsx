import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

// 3D-styled hiring icon
export const HiringIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
    <defs>
      <linearGradient id="hiring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
      <linearGradient id="hiring-shadow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#047857" />
        <stop offset="100%" stopColor="#065f46" />
      </linearGradient>
    </defs>
    {/* Shadow */}
    <ellipse cx="32" cy="58" rx="24" ry="4" fill="#00000015" />
    {/* Main body */}
    <circle cx="30" cy="30" r="20" fill="url(#hiring-gradient)" />
    {/* Face */}
    <circle cx="26" cy="26" r="2" fill="#ffffff" />
    <circle cx="34" cy="26" r="2" fill="#ffffff" />
    <path d="M26 34 Q30 38 34 34" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* Plus sign */}
    <rect x="46" y="18" width="12" height="3" rx="1.5" fill="url(#hiring-shadow)" />
    <rect x="50.5" y="13.5" width="3" height="12" rx="1.5" fill="url(#hiring-shadow)" />
    <rect x="45" y="17" width="12" height="3" rx="1.5" fill="#10B981" />
    <rect x="49.5" y="12.5" width="3" height="12" rx="1.5" fill="#10B981" />
  </svg>
);

// 3D-styled employee management icon
export const EmployeeManagementIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
    <defs>
      <linearGradient id="employee-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
      <linearGradient id="employee-shadow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1E40AF" />
        <stop offset="100%" stopColor="#1E3A8A" />
      </linearGradient>
    </defs>
    {/* Shadow */}
    <ellipse cx="32" cy="58" rx="28" ry="4" fill="#00000015" />
    {/* Main person */}
    <circle cx="32" cy="20" r="8" fill="url(#employee-gradient)" />
    <path d="M20 45 Q20 35 32 35 Q44 35 44 45 L44 50 L20 50 Z" fill="url(#employee-gradient)" />
    {/* Smaller people */}
    <circle cx="16" cy="26" r="5" fill="url(#employee-shadow)" opacity="0.8" />
    <path d="M8 42 Q8 38 16 38 Q24 38 24 42 L24 45 L8 45 Z" fill="url(#employee-shadow)" opacity="0.8" />
    <circle cx="48" cy="26" r="5" fill="url(#employee-shadow)" opacity="0.8" />
    <path d="M40 42 Q40 38 48 38 Q56 38 56 42 L56 45 L40 45 Z" fill="url(#employee-shadow)" opacity="0.8" />
    {/* Connecting lines */}
    <line x1="24" y1="20" x2="21" y2="26" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round" />
    <line x1="40" y1="20" x2="43" y2="26" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 3D-styled project management icon
export const ProjectManagementIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
    <defs>
      <linearGradient id="project-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#7C3AED" />
      </linearGradient>
      <linearGradient id="project-shadow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6D28D9" />
        <stop offset="100%" stopColor="#5B21B6" />
      </linearGradient>
    </defs>
    {/* Shadow */}
    <ellipse cx="32" cy="58" rx="26" ry="4" fill="#00000015" />
    {/* Briefcase body */}
    <rect x="12" y="25" width="40" height="28" rx="4" fill="url(#project-gradient)" />
    <rect x="14" y="27" width="36" height="24" rx="2" fill="url(#project-shadow)" />
    {/* Handle */}
    <rect x="28" y="18" width="8" height="10" rx="4" fill="none" stroke="url(#project-gradient)" strokeWidth="3" />
    {/* Lock */}
    <rect x="30" y="35" width="4" height="6" rx="1" fill="#ffffff" opacity="0.9" />
    <circle cx="32" cy="33" r="2" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.9" />
    {/* Side details */}
    <rect x="10" y="30" width="4" height="18" rx="2" fill="url(#project-shadow)" />
    <rect x="50" y="30" width="4" height="18" rx="2" fill="url(#project-shadow)" />
  </svg>
);

// 3D-styled users icon
export const UsersIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
    <defs>
      <linearGradient id="users-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>
    {/* Shadow */}
    <ellipse cx="32" cy="58" rx="28" ry="4" fill="#00000015" />
    {/* First person */}
    <circle cx="24" cy="22" r="8" fill="url(#users-gradient)" />
    <path d="M12 45 Q12 35 24 35 Q36 35 36 45 L36 50 L12 50 Z" fill="url(#users-gradient)" />
    {/* Second person */}
    <circle cx="40" cy="22" r="8" fill="url(#users-gradient)" opacity="0.8" />
    <path d="M28 45 Q28 35 40 35 Q52 35 52 45 L52 50 L28 50 Z" fill="url(#users-gradient)" opacity="0.8" />
  </svg>
);

// 3D-styled code icon
export const CodeIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
    <defs>
      <linearGradient id="code-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#7C3AED" />
      </linearGradient>
    </defs>
    {/* Shadow */}
    <ellipse cx="32" cy="58" rx="26" ry="4" fill="#00000015" />
    {/* Screen */}
    <rect x="8" y="12" width="48" height="32" rx="4" fill="url(#code-gradient)" />
    <rect x="12" y="16" width="40" height="24" rx="2" fill="#1E1B4B" />
    {/* Code lines */}
    <rect x="16" y="20" width="12" height="2" rx="1" fill="#10B981" />
    <rect x="30" y="20" width="8" height="2" rx="1" fill="#F59E0B" />
    <rect x="16" y="25" width="8" height="2" rx="1" fill="#EF4444" />
    <rect x="26" y="25" width="16" height="2" rx="1" fill="#3B82F6" />
    <rect x="16" y="30" width="20" height="2" rx="1" fill="#10B981" />
    <rect x="16" y="35" width="6" height="2" rx="1" fill="#F59E0B" />
    {/* Base */}
    <rect x="28" y="44" width="8" height="8" rx="2" fill="url(#code-gradient)" />
    <ellipse cx="32" cy="54" rx="12" ry="2" fill="url(#code-gradient)" opacity="0.6" />
  </svg>
);

// Add more 3D icons as needed...