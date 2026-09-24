import React from 'react';
import { motion } from 'framer-motion';

const WelcomeMessage = () => {
  return (
    <motion.div
      className='text-sm sm:text-base md:text-lg text-white leading-relaxed w-full bg-blue-600 p-4 sm:p-6 rounded-xl shadow-lg'
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p className="font-bold text-lg sm:text-xl md:text-2xl mb-2">Bem-vindo ao CicloFriend!</p>
      <p>Gerencie suas amizades e encontros de forma simples e segura.</p>
    </motion.div>
  );
};

export default WelcomeMessage;