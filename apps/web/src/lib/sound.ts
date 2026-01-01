/**
 * Sound notification utility
 * Play audio notification for transaction success
 */

export const playTransactionSound = async () => {
  try {
    // Coba play notification sound menggunakan Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Create success notification sound (beep pattern)
    // High beep (1000Hz) + Medium beep (800Hz) pattern
    const playBeep = async (frequency: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    };

    // Play success pattern: 2 beeps
    await playBeep(1000, 0.2); // High beep
    await new Promise((resolve) => setTimeout(resolve, 150)); // Delay
    await playBeep(1200, 0.3); // Higher beep
  } catch (error) {
    console.log("Audio playback not supported or blocked:", error);
  }
};

export const playFailureSound = async () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    const playBeep = async (frequency: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    };

    // Play error pattern: low beep
    await playBeep(400, 0.4); // Low beep
  } catch (error) {
    console.log("Audio playback not supported or blocked:", error);
  }
};
