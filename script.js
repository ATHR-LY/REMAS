const toast = document.getElementById('copyToast');
const copyButtons = document.querySelectorAll('.copy-btn');

let toastTimer;

function playClickSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    const playTone = (frequency, startTime) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.055, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.11);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.12);
    };

    // النغمة الأولى
    playTone(660, ctx.currentTime);

    // النغمة الثانية أعلى قليلًا
    playTone(880, ctx.currentTime + 0.08);

  } catch (e) {}
}


function playErrorSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch (e) {}
}

function vibrateDevice() {
  if (navigator.vibrate) navigator.vibrate(45);
}
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
}

function copyToClipboard(text, button) {
  const originalText = button.textContent;
  const toastMessage = originalText.replace('نسخ', 'تم نسخ') + ' بنجاح';

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => {
        playClickSound();
        vibrateDevice();
        showToast(toastMessage);
        button.textContent = 'تم النسخ ✓';
        button.classList.add('copied');
        setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove('copied');
        }, 1500);
      })
      .catch(() => fallbackCopy(text, button));
  } else {
    fallbackCopy(text, button);
  }
}

function fallbackCopy(text, button) {
  const originalText = button.textContent;
  const toastMessage = originalText.replace('نسخ', 'تم نسخ') + ' بنجاح';

  const temp = document.createElement('textarea');
  temp.value = text;
  temp.style.position = 'fixed';
  temp.style.left = '-9999px';
  temp.style.top = '0';
  document.body.appendChild(temp);
  temp.focus();
  temp.select();

  try {
    document.execCommand('copy');
    playClickSound();
    vibrateDevice();
    showToast(toastMessage);
    button.textContent = 'تم النسخ ✓';
    button.classList.add('copied');
    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('copied');
    }, 1500);
  } catch (error) {
    console.error('فشل النسخ:', error);
    playErrorSound();
  }


  document.body.removeChild(temp);
}

copyButtons.forEach(button => {
  button.addEventListener('click', () => {
    const text = button.dataset.copy;

    if (!text) return;

    copyToClipboard(text, button);
  });
});