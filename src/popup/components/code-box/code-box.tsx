import React, { useState, useCallback } from 'react';
import './code-box.scss';

import Anime from 'react-anime';
import copyUtil from '../../../services/copy-util';

const CodeBox: React.FC<{ code: string; label: string }> = ({ code, label }) => {
  const [hovering, setHovering] = useState(false);
  const [copied, setCopied] = useState(false);
  const startCopying = useCallback(() => {
    if (copied) return;
    setCopied(true);
    setTimeout((): void => {
      setCopied(false);
      setHovering(false);
    }, 1500);
  }, [copied]);
  const handleHovering = useCallback(
    (newVal: boolean) => {
      if (copied) return;
      setHovering(newVal);
    },
    [copied]
  );
  return (
    <div className="code-box--wrapper">
      <button
        className="code-box"
        onClick={(): void => {
          copyUtil(code);
          startCopying();
        }}
        onMouseEnter={(): void => handleHovering(true)}
        onMouseLeave={(): void => handleHovering(false)}
        type="button"
      >
        <div className="code-box__value">{code}</div>
        <Anime delay={50} translateY={[8, 0]} opacity={[0, 1]}>
          {copied ? (
            <div className="code-box__label code-box__label--action">Copied to Clipboard!</div>
          ) : (
            <>
              {hovering ? (
                <div className="code-box__label code-box__label--action">Copy to Clipboard</div>
              ) : (
                <div className="code-box__label">{label}</div>
              )}
            </>
          )}
        </Anime>
      </button>
    </div>
  );
};

export default CodeBox;
