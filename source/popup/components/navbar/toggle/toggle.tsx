import React from 'react';
import './toggle.scss';
import { motion } from 'framer-motion';

const animateToggle = {
  expand: {
    rotate: 135,
    rotateX: 0,
    opacity: 1
  },
  minimize: {
    rotate: 45,
    rotateX: -10,
    opacity: 0
  },
  reset: {
    rotate: 0
  },
  rotate: {
    rotate: 180
  }
};

const Toggle: React.FC<{
  close: () => void;
  expand: () => void;
  collapse: () => void;
  collapsed: boolean;
  payMode?: boolean;
}> = ({ close, expand, collapse, collapsed = false, payMode = false }) => (
  <div className="header-bar__controls">
    <motion.button
      whileTap={{ scale: 0.96 }}
      type="button"
      onClick={collapsed ? expand : collapse}
      className="header-bar__controls__toggle--wrapper"
    >
      <motion.svg className="header-bar__controls__toggle" width="20" height="20" viewBox="0 0 20 20">
        <motion.g fill="none" fillRule="evenodd">
          <motion.circle fill={payMode ? '#31436C' : '#F5F5F7'} cx="10" cy="10" r="10" />
          <motion.g fill="none" animate={collapsed ? 'rotate' : 'reset'} variants={animateToggle} initial="reset">
            <motion.path
              fill={payMode ? '#FFFFFF' : '#434D5A'}
              fillRule="nonzero"
              transform="rotate(45 9.994 10.003)"
              d="M7.60615758,13.3552246 C7.43435105,13.5349256 7.1785153,13.607612 6.93767473,13.5451496 C6.69683416,13.4826872 6.50878612,13.2948788 6.44631695,13.0544179 C6.38384779,12.8139571 6.45676135,12.5585816 6.63683555,12.3871378 L12.4027945,6.62929804 C12.672114,6.37155478 13.0983697,6.37587442 13.3623928,6.63902254 C13.6264159,6.90217065 13.6314399,7.32770138 13.3737029,7.59698889 L7.60615758,13.3552246 Z"
            />
          </motion.g>
          <motion.path
            animate={collapsed ? 'expand' : 'minimize'}
            variants={animateToggle}
            initial="minimize"
            fill={payMode ? '#FFFFFF' : '#434D5A'}
            fillRule="nonzero"
            d="M7.60615758,13.3552246 C7.43435105,13.5349256 7.1785153,13.607612 6.93767473,13.5451496 C6.69683416,13.4826872 6.50878612,13.2948788 6.44631695,13.0544179 C6.38384779,12.8139571 6.45676135,12.5585816 6.63683555,12.3871378 L12.4027945,6.62929804 C12.672114,6.37155478 13.0983697,6.37587442 13.3623928,6.63902254 C13.6264159,6.90217065 13.6314399,7.32770138 13.3737029,7.59698889 L7.60615758,13.3552246 Z"
          />
        </motion.g>
      </motion.svg>
    </motion.button>

    <motion.button whileTap={{ scale: 0.96 }} onClick={close} type="button">
      <svg width="20" height="20" viewBox="0 0 20 20">
        <g fill="none" fillRule="evenodd">
          <circle fill={payMode ? '#31436C' : '#F5F5F7'} cx="10" cy="10" r="10" />
          <path
            fill={payMode ? '#FFFFFF' : '#434D5A'}
            fillRule="nonzero"
            d="M10.9788242,9.99524148 L13.3763494,12.3887321 C13.6386865,12.6569753 13.636114,13.0859697 13.3705788,13.3510581 C13.1050436,13.6161464 12.675326,13.6187146 12.4066307,13.3568189 L10.0095021,10.964912 L7.61039047,13.3584027 C7.43858394,13.5381037 7.18274819,13.6107901 6.94190762,13.5483277 C6.70106705,13.4858653 6.51301901,13.2980569 6.45054984,13.0575961 C6.38808067,12.8171353 6.46099424,12.5617598 6.64106844,12.3903159 L9.03700721,9.99524148 L6.63948199,7.60175082 C6.4637852,7.42910512 6.39437013,7.17563144 6.45764527,6.93776212 C6.52092041,6.6998928 6.7071583,6.51419616 6.94550599,6.45131923 C7.18385369,6.3884423 7.43766932,6.45805133 7.61039047,6.63366403 L10.0095021,9.02755063 L12.4070274,6.63247619 C12.6763469,6.37473293 13.1026026,6.37905257 13.3666257,6.64220069 C13.6306488,6.9053488 13.6356728,7.33087954 13.3779358,7.60016704 L10.9788242,9.99524148 Z"
          />
        </g>
      </svg>
    </motion.button>
  </div>
);

export default Toggle;
