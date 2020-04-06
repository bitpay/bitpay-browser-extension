import React, { useState } from 'react';
import './code-box.scss';

import Anime, { anime } from 'react-anime';
import copyUtil from '../../../services/copy-util';

const CodeBox: React.FC<{ code: string; label: string }> = ({ code, label }) => {
  const [hovering, setHovering] = useState(false);
  return (
    <div className="code-box--wrapper">
      <button
        className="code-box"
        onClick={(): void => copyUtil(code)}
        onMouseEnter={(): void => setHovering(true)}
        onMouseLeave={(): void => setHovering(false)}
        type="button"
      >
        <div className="code-box__value">{code}</div>
        <Anime delay={anime.stagger(50)} translateY={[8, 0]} opacity={[0, 1]}>
          {hovering ? (
            <div className="code-box__label code-box__label--action">Copy to Clipboard</div>
          ) : (
            <div className="code-box__label">{label}</div>
          )}
        </Anime>
      </button>
    </div>
  );
};

export default CodeBox;
