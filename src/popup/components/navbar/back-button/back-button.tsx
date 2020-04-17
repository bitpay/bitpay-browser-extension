import React from 'react';
import './back-button.scss';
import { motion } from 'framer-motion';
import { FrameDimensions } from '../../../../services/frame';

const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <motion.button
    key="BackButton"
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0, y: -1, transition: { duration: 0.1 } }}
    exit={{ opacity: 0, x: FrameDimensions.width * -3 }}
    className="back-button"
    type="button"
    onClick={onClick}
  >
    <img alt="go back" src="../assets/icons/go-back-icon.svg" />
    <span style={{ transform: 'translate(-0.5px, 0.5px)' }}>Back</span>
  </motion.button>
);

export default BackButton;
