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
