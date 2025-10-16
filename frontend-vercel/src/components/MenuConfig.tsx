'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Layout, 
  ChevronLeft, 
  ChevronRight, 
  Menu as MenuIcon,
  Settings
} from 'lucide-react';

export type MenuPosition = 'top' | 'left' | 'right';

interface MenuConfigProps {
  position: MenuPosition;
  onPositionChange: (position: MenuPosition) => void;
}

const menuPositions = [
  { 
    value: 'top' as MenuPosition, 
    label: 'Superior', 
    icon: MenuIcon,
    description: 'Menu horizontal no topo'
  },
  { 
    value: 'left' as MenuPosition, 
    label: 'Esquerda', 
    icon: ChevronLeft,
    description: 'Menu lateral esquerdo'
  },
  { 
    value: 'right' as MenuPosition, 
    label: 'Direita', 
    icon: ChevronRight,
    description: 'Menu lateral direito'
  }
];

export default function MenuConfig({ position, onPositionChange }: MenuConfigProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Salvar preferência no localStorage
  useEffect(() => {
    localStorage.setItem('menuPosition', position);
  }, [position]);

  return (
    <div className="relative z-[80]">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-white/10 transition-all duration-300"
        title="Configurar Menu"
      >
        <Layout className="w-4 h-4 text-white/80" />
      </motion.button>

      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Config Panel */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2 w-80 max-w-[calc(100vw-2rem)] bg-slate-800/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl z-[9999]"
          >
            <div className="p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Settings className="w-5 h-5 text-white/80" />
                <h3 className="text-white font-semibold">Configuração do Menu</h3>
              </div>
              
              <div className="space-y-3">
                <p className="text-white/60 text-sm mb-3">
                  Escolha a posição do menu principal:
                </p>
                
                {menuPositions.map((pos) => (
                  <motion.button
                    key={pos.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onPositionChange(pos.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                      position === pos.value
                        ? 'bg-white/20 text-white border border-white/30'
                        : 'bg-white/5 text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      position === pos.value
                        ? 'bg-white/20'
                        : 'bg-white/10'
                    }`}>
                      <pos.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">{pos.label}</p>
                      <p className="text-xs text-white/60">{pos.description}</p>
                    </div>
                    {position === pos.value && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 bg-green-400 rounded-full"
                      />
                    )}
                  </motion.button>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-white/50">
                  Sua preferência será salva automaticamente
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}


