import React from 'react';
import './action-button.scss';

import { motion } from 'framer-motion';

function setFlavor(flavor?: string): string {
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

const ActionButton: React.FC<{
  onClick?: () => void;
  flavor?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  children?: unknown;
}> = ({ onClick, children, flavor, disabled, type = 'button' }) => (
  <motion.button
    className={`action-button${setFlavor(flavor)}`}
    type={type}
    whileTap={{ scale: 0.96 }}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </motion.button>
);

export default ActionButton;
