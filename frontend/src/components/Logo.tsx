'use client';

import React from 'react';
import { Trophy } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'default' | 'minimal' | 'full';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
};

const textSizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl'
};

export default function Logo({ 
  size = 'md', 
  showText = true, 
  variant = 'default',
  className = ''
}: LogoProps) {
  const logoSize = sizeClasses[size];
  const textSize = textSizes[size];

  // Logo personalizada da 4SET ARENA
  const hasCustomLogo = true;
  
  if (hasCustomLogo) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className={`${logoSize} relative`}>
          <img
            src="/images/logo.svg" // Logo da 4SET ARENA
            alt="4SET ARENA"
            className="w-full h-full object-contain"
          />
        </div>
        {showText && variant !== 'minimal' && (
          <div className="flex flex-col">
            <span className={`${textSize} font-bold text-white`}>
              {variant === 'full' ? '4SET ARENA' : '4SET ARENA'}
            </span>
            {variant === 'full' && (
              <span className="text-xs text-white/60">Sistema Esportivo</span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Logo placeholder com ícone
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`${logoSize} bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center`}>
        <Trophy className={`${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : size === 'lg' ? 'w-7 h-7' : 'w-8 h-8'} text-white`} />
      </div>
      {showText && variant !== 'minimal' && (
        <div className="flex flex-col">
          <span className={`${textSize} font-bold text-white`}>
            {variant === 'full' ? 'Nome da Sua Empresa' : '4Set Sports'}
          </span>
          {variant === 'full' && (
            <span className="text-xs text-white/60">Sistema Esportivo</span>
          )}
        </div>
      )}
    </div>
  );
}
