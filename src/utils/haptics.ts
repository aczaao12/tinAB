/**
 * Haptic Vibration Feedback for Mobile Devices
 */

export function triggerVibrate(pattern: 'correct' | 'wrong' | 'tap' | 'submit') {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      if (pattern === 'wrong') {
        // Strong double buzz for incorrect answers
        navigator.vibrate([100, 50, 120]);
      } else if (pattern === 'correct') {
        // Crisp single pulse for correct answers
        navigator.vibrate(40);
      } else if (pattern === 'submit') {
        // Triple pulse for exam submit
        navigator.vibrate([60, 40, 60, 40, 80]);
      } else {
        // Subtle tap
        navigator.vibrate(20);
      }
    }
  } catch {
    // Silently ignore if disabled or unsupported
  }
}
