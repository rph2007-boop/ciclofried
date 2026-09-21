import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, X, Palette } from 'lucide-react';

const COLOR_GROUPS = [
  {
    name: "Classic",
    colors: [
      'linear-gradient(to right, #2563eb, #4f46e5, #9333ea)', // Default
      'linear-gradient(to right, #1f2937, #111827)', // Dark
      'linear-gradient(to right, #6b7280, #374151)', // Gray
      'linear-gradient(to right, #f3f4f6, #d1d5db)', // Light
      'linear-gradient(135deg, #000000 0%, #434343 100%)', // Rich Black
    ]
  },
  {
    name: "Blues & Cyans",
    colors: [
      'linear-gradient(135deg, #bfdbfe 0%, #3b82f6 100%)', 
      'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',
      'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
      'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', // Cyan Blue
      'linear-gradient(135deg, #a5f3fc 0%, #0891b2 100%)',
      'linear-gradient(to right, #4ade80, #3b82f6)', // Green Blue
    ]
  },
  {
    name: "Purples & Pinks",
    colors: [
      'linear-gradient(to right, #ec4899, #8b5cf6)', // Pink Purple
      'linear-gradient(135deg, #e9d5ff 0%, #a855f7 100%)',
      'linear-gradient(135deg, #c084fc 0%, #7e22ce 100%)',
      'linear-gradient(135deg, #fbcfe8 0%, #ec4899 100%)',
      'linear-gradient(135deg, #f472b6 0%, #db2777 100%)',
      'linear-gradient(to right, #6366f1, #a855f7, #ec4899)', // Indigo Pink
    ]
  },
  {
    name: "Reds & Oranges",
    colors: [
      'linear-gradient(to right, #ef4444, #b91c1c)', // Red
      'linear-gradient(135deg, #fca5a5 0%, #ef4444 100%)',
      'linear-gradient(135deg, #f87171 0%, #dc2626 100%)',
      'linear-gradient(to right, #f59e0b, #ea580c)', // Orange Amber
      'linear-gradient(135deg, #fdba74 0%, #ea580c 100%)',
      'linear-gradient(135deg, #fb923c 0%, #c2410c 100%)',
    ]
  },
  {
    name: "Greens & Yellows",
    colors: [
      'linear-gradient(to right, #10b981, #059669)', // Emerald
      'linear-gradient(135deg, #86efac 0%, #22c55e 100%)',
      'linear-gradient(135deg, #4ade80 0%, #16a34a 100%)',
      'linear-gradient(135deg, #fde047 0%, #eab308 100%)',
      'linear-gradient(135deg, #facc15 0%, #ca8a04 100%)',
      'linear-gradient(135deg, #bef264 0%, #65a30d 100%)',
    ]
  },
  {
    name: "Special",
    colors: [
      'linear-gradient(to right, #cc2b5e, #753a88)',
      'linear-gradient(to right, #42275a, #734b6d)',
      'linear-gradient(to right, #de6262, #ffb88c)',
      'linear-gradient(to right, #000428, #004e92)',
      'linear-gradient(to right, #4568dc, #b06ab3)',
      'linear-gradient(to right, #ff9966, #ff5e62)',
    ]
  }
];

const ColorPicker = ({ selectedColor, onSelect, onClose }) => {
  const [customColor, setCustomColor] = useState('');

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customColor) {
      onSelect(customColor);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
             <div className="flex items-center gap-3 text-gray-800">
                <div className="bg-blue-100 p-2.5 rounded-full">
                  <Palette className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                   <h3 className="font-heading font-bold text-lg leading-tight">Cover Color</h3>
                   <p className="text-xs text-gray-500">Customize the card appearance</p>
                </div>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                <X className="w-5 h-5" />
             </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
             
             {/* Selected Preview */}
             <div className="mb-8">
               <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Current Preview</label>
               <div 
                 className="h-24 rounded-2xl shadow-inner border border-black/5 transition-all duration-500"
                 style={{ background: selectedColor }}
               />
             </div>

             {/* Color Groups */}
             <div className="space-y-8">
               {COLOR_GROUPS.map((group) => (
                 <div key={group.name}>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                       <span className="w-1 h-4 bg-gray-200 rounded-full"></span>
                       {group.name}
                    </h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                       {group.colors.map((color, idx) => (
                          <button
                            key={idx}
                            onClick={() => onSelect(color)}
                            className="aspect-square w-full rounded-xl shadow-sm hover:shadow-lg hover:scale-105 transition-all relative group overflow-hidden border border-black/5"
                            style={{ background: color }}
                            title={color}
                          >
                             {selectedColor === color && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                                   <div className="bg-white rounded-full p-1 shadow-sm">
                                      <Check className="w-3 h-3 text-black" />
                                   </div>
                                </div>
                             )}
                          </button>
                       ))}
                    </div>
                 </div>
               ))}
             </div>
             
             {/* Custom Input */}
             <div className="mt-8 pt-6 border-t border-gray-100">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Custom Hex or Gradient</label>
                <form onSubmit={handleCustomSubmit} className="flex gap-2">
                   <input 
                      type="text" 
                      placeholder="#000000 or linear-gradient(...)" 
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                   />
                   <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
                      Apply
                   </Button>
                </form>
             </div>
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
             <Button onClick={onClose} variant="default" className="bg-gray-900 text-white hover:bg-black">
                Done
             </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ColorPicker;