import React from 'react';
import './action-button.scss';

import { motion } from 'framer-motion';

function setFlavor(flavor: string): string {
  switch (flavor) {
    case 'warn':
      return ' action-button--warn';
    case 'danger':
      return ' action-button--danger';
    case 'light':
      return ' action-button--light';
    default:
      return '';
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ActionButton: React.FC<any> = ({ onClick, children, flavor, disabled, type }) => (
  <motion.button
    className={`action-button${setFlavor(flavor)}`}
    type={type || 'button'}
    whileTap={{ scale: 0.96 }}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </motion.button>
);

export default ActionButton;
