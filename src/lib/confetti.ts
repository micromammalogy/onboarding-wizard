import confetti from 'canvas-confetti';

export const fireCompletionConfetti = () => {
  const duration = 3000;
  const end = Date.now() + duration;

  const colors = ['#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626', '#DB2777'];

  // Firework bursts from multiple positions
  const firework = (originX: number, originY: number) => {
    confetti({
      particleCount: 80,
      startVelocity: 45,
      spread: 360,
      ticks: 80,
      origin: { x: originX, y: originY },
      colors,
      zIndex: 9999,
      scalar: 1.1,
    });
  };

  // Initial burst — three fireworks at once
  firework(0.2, 0.4);
  firework(0.5, 0.35);
  firework(0.8, 0.4);

  // Follow-up bursts staggered
  setTimeout(() => { firework(0.15, 0.5); firework(0.85, 0.45); }, 300);
  setTimeout(() => { firework(0.4, 0.3); firework(0.65, 0.35); }, 600);

  // Continuous gentle float-down confetti
  const floatDown = () => {
    if (Date.now() < end) {
      confetti({
        particleCount: 6,
        angle: 90,
        spread: 120,
        startVelocity: 20,
        origin: { x: Math.random(), y: 0 },
        colors,
        ticks: 200,
        gravity: 0.6,
        drift: 0.3,
        scalar: 0.9,
        zIndex: 9999,
      });
      requestAnimationFrame(floatDown);
    }
  };

  setTimeout(floatDown, 700);
};
