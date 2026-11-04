



(function (root) {
  'use strict';

  var audioCtx = null;

  function getCtx() {
    if (typeof window === 'undefined') return null;
    var AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtx) {
      try {
        audioCtx = new AudioContextClass();
      } catch (e) {
        return null;
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      try { audioCtx.resume(); } catch (e) {}
    }
    return audioCtx;
  }

  function playTone(freq, type, durationSec, gainLevel, startOffsetSec) {
    var ctx = getCtx();
    if (!ctx) return;
    try {
      var now = ctx.currentTime + (startOffsetSec || 0);
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(gainLevel || 0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + durationSec);
    } catch (e) {}
  }

  root.SeenJeemAudio = {
    getAudioContext: getCtx,
    enabled: true,
    vibrate: function (ms) {
      try {
        if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
          navigator.vibrate(ms || 12);
        }
      } catch (e) {}
    },
    playClick: function () {
      this.vibrate(8);
      if (!this.enabled) return;
      playTone(520, 'sine', 0.07, 0.09, 0);
    },
    playSelectCard: function () {
      if (!this.enabled) return;
      playTone(587.33, 'triangle', 0.09, 0.11, 0);
      playTone(880, 'triangle', 0.12, 0.11, 0.06);
    },
    playOpenQuestion: function () {
      if (!this.enabled) return;
      playTone(440, 'sine', 0.1, 0.12, 0);
      playTone(554.37, 'sine', 0.1, 0.12, 0.08);
      playTone(659.25, 'sine', 0.18, 0.14, 0.16);
    },
    playLifeline: function () {
      if (!this.enabled) return;
      playTone(659.25, 'triangle', 0.1, 0.13, 0);
      playTone(987.77, 'triangle', 0.18, 0.14, 0.08);
    },
    playRevealAnswer: function () {
      if (!this.enabled) return;
      playTone(523.25, 'triangle', 0.12, 0.14, 0);
      playTone(659.25, 'triangle', 0.12, 0.14, 0.09);
      playTone(783.99, 'triangle', 0.14, 0.14, 0.18);
      playTone(1046.5, 'triangle', 0.28, 0.16, 0.27);
    },
    playAwardPoints: function () {
      if (!this.enabled) return;
      playTone(659.25, 'sine', 0.1, 0.15, 0);
      playTone(880, 'sine', 0.22, 0.16, 0.09);
    },
    playTick: function () {
      if (!this.enabled) return;
      playTone(800, 'sine', 0.04, 0.06, 0);
    },
    playTimeUp: function () {
      if (!this.enabled) return;
      playTone(320, 'sawtooth', 0.18, 0.12, 0);
      playTone(240, 'sawtooth', 0.3, 0.12, 0.16);
    },
    playFanfare: function () {
      if (!this.enabled) return;
      var notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach(function (n, idx) {
        playTone(n, 'triangle', 0.22, 0.16, idx * 0.12);
      });
    }
  };
})(typeof self !== 'undefined' ? self : this);
  
  
  
