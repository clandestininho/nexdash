/**
 * NEXDASH Synthesized Sound Manager
 * Uses the Web Audio API to generate high-fidelity electronic tones
 * without relying on external media files.
 */

let audioCtx = null;

/**
 * Initializes and returns the shared browser AudioContext.
 * Resumes it if suspended by the browser's autoplay policies.
 */
function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a short, clean high-frequency electronic beep.
 * Great for minor successes, interface interactions, or quick updates.
 */
export function playBeep() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(659.25, now); // E5 Note

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  } catch (err) {
    console.warn('[Sound] Web Audio playBeep blocked or not supported:', err.message);
  }
}

/**
 * Plays a gorgeous electronic double-tone chime (bell sound).
 * Ideal for critical business achievements like new closed clients or successful signatures.
 */
export function playBell() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // First tone: G5 (783.99 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(783.99, now);

    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    // Second tone: C6 (1046.50 Hz) slightly delayed
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.50, now + 0.08);

    gain2.gain.setValueAtTime(0.0, now);
    gain2.gain.setValueAtTime(0.15, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.7);

    osc2.start(now + 0.08);
    osc2.stop(now + 1.0);
  } catch (err) {
    console.warn('[Sound] Web Audio playBell blocked or not supported:', err.message);
  }
}

/**
 * Plays an ascending premium arpeggio of C5 -> E5 -> G5 -> C6.
 * Perfect for standard new incoming notifications, WhatsApp messages, or lead captures.
 */
export function playNotification() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.0, now);
      gain.gain.setValueAtTime(0.1, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.35);
    });
  } catch (err) {
    console.warn('[Sound] Web Audio playNotification blocked or not supported:', err.message);
  }
}

/**
 * Plays a descending triangle sweep representing an alert, warning or error state.
 */
export function playWarning() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440.00, now); // A4
    osc.frequency.linearRampToValueAtTime(329.63, now + 0.3); // E4

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  } catch (err) {
    console.warn('[Sound] Web Audio playWarning blocked or not supported:', err.message);
  }
}
