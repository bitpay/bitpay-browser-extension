import React from 'react';
import './code-box.scss';

import copyUtil from '../../../services/copy-util';

const CodeBox: React.FC<{ code: string; label: string }> = ({ code, label }) => (
  <button className="code-box" onClick={(): void => copyUtil(code)} type="button">
    <div className="code-box__value">{code}</div>
    <div className="code-box__label">{label}</div>
    <div className="code-box__label code-box__label--action">Copy to Clipboard</div>
  </button>
);

export default CodeBox;
