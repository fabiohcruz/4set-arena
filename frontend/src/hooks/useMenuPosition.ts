'use client';

import { useState, useEffect } from 'react';
import { MenuPosition } from '@/components/MenuConfig';

export function useMenuPosition() {
  const [position, setPosition] = useState<MenuPosition>('left');

  useEffect(() => {
    // Carregar preferência salva apenas no cliente
    if (typeof window !== 'undefined') {
      const savedPosition = localStorage.getItem('menuPosition') as MenuPosition;
      if (savedPosition && ['top', 'left', 'right'].includes(savedPosition)) {
        setPosition(savedPosition);
      }
    }
  }, []);

  const changePosition = (newPosition: MenuPosition) => {
    setPosition(newPosition);
    if (typeof window !== 'undefined') {
      localStorage.setItem('menuPosition', newPosition);
    }
  };

  return {
    position,
    changePosition,
    isTop: position === 'top',
    isLeft: position === 'left',
    isRight: position === 'right'
  };
}


