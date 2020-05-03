export const listAnimation = {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  base: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 250,
      delay: i * 0.04
    }
  }),
  delta: { opacity: 0, y: -32 }
};

export const buttonAnimation = {
  visible: {
    opacity: 1,
    transition: {
      type: 'tween',
      duration: 0.2,
      when: 'beforeChildren',
      staggerChildren: 0.075
    }
  },
  hidden: {
    opacity: 0
  }
};

export const buttonTextAnimation = {
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      damping: 100,
      stiffness: 100,
      mass: 0.25
    }
  },
  hidden: {
    opacity: 0,
    x: 12
  }
};

export const buttonSpinnerAnimation = {
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      damping: 100,
      stiffness: 150,
      mass: 0.5
    }
  },
  hidden: {
    opacity: 0,
    x: 10
  }
};

export const spinAnimation = {
  visible: {
    rotate: 360,
    transition: {
      loop: Infinity,
      ease: 'linear',
      duration: 1
    }
  }
};
