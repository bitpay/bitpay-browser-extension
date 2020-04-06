import React, { useState, useRef } from 'react';
import './code-box.scss';

import copyUtil from '../../../services/copy-util';

const CodeBox: React.FC<{ code: string; label: string }> = ({ code, label }) => {
  const box = useRef<HTMLButtonElement>(null);
  const value = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const boxClicked = (val: string): void => {
    copyUtil(val);
    if (!copied && box.current && value.current) {
      setCopied(true);
      box.current.style.transform = 'scale(1.03)';
      value.current.style.color = '#4f6ef7';
      setTimeout((): void => {
        box.current.style.transform = 'initial';
      }, 300);
      setTimeout((): void => {
        value.current.style.color = 'initial';
        setCopied(false);
      }, 1500);
    }
  };
  return (
    <div className="code-box--wrapper">
      <button className="code-box" onClick={(): void => boxClicked(code)} ref={box} type="button">
        <div className="code-box__value" ref={value}>
          {code}
        </div>
        <div className="code-box__label">{label}</div>
        <div className="code-box__label code-box__label--action">Copy to Clipboard</div>
      </button>
    </div>
  );
};

export default CodeBox;
