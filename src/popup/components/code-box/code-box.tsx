import React, { useState, useCallback } from 'react';
import './code-box.scss';

import { motion } from 'framer-motion';
import copyUtil from '../../../services/copy-util';

const animateLabels = {
  base: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.3
    }
  },
  delta: {
    opacity: 0,
    y: 8,
    transition: {
      delay: 0.15
    }
  }
};

const CodeBox: React.FC<{ code: string; label: string }> = ({ code, label }) => {
  const [hovering, setHovering] = useState(false);
  const [copied, setCopied] = useState(false);
  const startCopying = useCallback(() => {
    copyUtil(code);
    if (copied) return;
    setCopied(true);
    setTimeout((): void => {
      setCopied(false);
    }, 1500);
  }, [copied, code]);
  return (
    <div className="code-box--wrapper">
      <motion.button
        className="code-box"
        whileHover={{ scale: 0.98 }}
        whileTap={{ scale: 1.03 }}
        onHoverStart={(): void => setHovering(true)}
        onHoverEnd={(): void => setHovering(false)}
        onTapStart={startCopying}
        type="button"
      >
        <motion.div className="code-box__value" animate={{ color: copied ? '#4f6ef7' : '#000000' }}>
          {code}
        </motion.div>
        <div className="code-box__label--wrapper">
          <motion.div
            className="code-box__label"
            animate={!copied && !hovering ? 'base' : 'delta'}
            variants={animateLabels}
          >
            {label}
          </motion.div>
          <motion.div
            className="code-box__label code-box__label--action"
            animate={!copied && hovering ? 'base' : 'delta'}
            initial={false}
            variants={animateLabels}
          >
            Copy to Clipboard
          </motion.div>
          <motion.div
            className="code-box__label code-box__label--action"
            animate={copied ? 'base' : 'delta'}
            initial={false}
            variants={animateLabels}
          >
            Copied to Clipboard!
          </motion.div>
        </div>
      </motion.button>
    </div>
  );
};

export default CodeBox;
