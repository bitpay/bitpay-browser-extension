import React from 'react';
import './back-button.scss';

import { motion } from 'framer-motion';

const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <motion.button
    initial={{ opacity: 0, x: -65 }}
    animate={{ opacity: 1, x: 0, y: -1, transition: { duration: 0.05, easing: 'linear' } }}
    exit={{ opacity: 0, x: -1000, transition: { duration: 0.15, easing: 'linear' } }}
    className="back-button"
    type="button"
    onClick={onClick}
  >
    <img alt="go back" src="../assets/icons/go-back-icon.svg" />
    <span style={{ transform: 'translate(-0.5px, 0.5px)' }}>Back</span>
  </motion.button>
);

export default BackButton;
