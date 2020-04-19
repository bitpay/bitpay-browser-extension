import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import copyUtil from '../../../services/copy-util';
import { wait } from '../../../services/utils';
import './code-box.scss';

const animateLabels = {
  base: {
    opacity: 1,
    y: 0
  },
  delta: {
    opacity: 0,
    y: 8
  }
};

const CodeBox: React.FC<{ code: string; label: string }> = ({ code, label }) => {
  const mountedRef = useRef(true);
  const [hovering, setHovering] = useState(false);
  const [copied, setCopied] = useState(false);
  const startCopying = useCallback(async () => {
    copyUtil(code);
    if (copied) return;
    setCopied(true);
    await wait(1500);
    if (mountedRef.current) setCopied(false);
  }, [copied, code]);
  const changeHovering = (val: boolean) => (): void => {
    setHovering(val);
  };
  useEffect(
    () => (): void => {
      mountedRef.current = false;
    },
    []
  );
  return (
    <div className="code-box--wrapper">
      <motion.button
        className="code-box"
        whileHover={{ scale: 0.98 }}
        whileTap={{ scale: 1.03 }}
        onHoverStart={changeHovering(true)}
        onHoverEnd={changeHovering(false)}
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
