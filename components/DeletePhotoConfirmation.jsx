import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2 } from 'lucide-react';

const DeletePhotoConfirmation = ({ open, photoUrl, onConfirm, onCancel }) => {
  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onCancel}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 overflow-hidden relative"
          onClick={(e) => e.stopPropagation()}
        >
           <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                 <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Photo?</h3>
              <p className="text-gray-500 text-sm mb-6">
                 Are you sure you want to delete this photo? This action cannot be undone.
              </p>

              {photoUrl && (
                 <div className="w-24 h-24 rounded-lg overflow-hidden mb-6 border border-gray-200 shadow-sm mx-auto bg-gray-50">
                    <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                 </div>
              )}

              <div className="grid grid-cols-2 gap-3 w-full">
                 <Button variant="outline" onClick={onCancel} className="border-gray-200 hover:bg-gray-50 text-gray-700">
                    Cancel
                 </Button>
                 <Button variant="destructive" onClick={onConfirm} className="bg-red-500 hover:bg-red-600 text-white">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                 </Button>
              </div>
           </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DeletePhotoConfirmation;