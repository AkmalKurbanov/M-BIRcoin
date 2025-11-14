document.querySelectorAll('.progress-bar').forEach(bar => {
  const current = Number(bar.dataset.current.replace(/\s/g, ''));
  const total = Number(bar.dataset.total.replace(/\s/g, ''));
  const targetPercent = total > 0 ? (current / total) * 100 : 0;
  const line = bar.querySelector('.progress-bar__line');

  let currentPercent = 0;
  const step = targetPercent / 60; // скорость (~1 сек)

  const animate = () => {
    currentPercent += step;
    if (currentPercent >= targetPercent) {
      currentPercent = targetPercent;
    } else {
      requestAnimationFrame(animate);
    }

    // Форматируем процент: без .0 если целое, с .1 если нецелое
    const raw = currentPercent;
    const visiblePercent = (raw % 1 === 0) ? raw.toFixed(0) : raw.toFixed(1);
    const text = `${visiblePercent}%`;
    line.textContent = text;


    if (currentPercent < 15) {
      const tempSpan = document.createElement('span');
      tempSpan.textContent = text;
      tempSpan.style.position = 'absolute';
      tempSpan.style.visibility = 'hidden';
      tempSpan.style.fontSize = getComputedStyle(line).fontSize;
      document.body.appendChild(tempSpan);

      const textWidth = tempSpan.offsetWidth + 8; // небольшой отступ
      document.body.removeChild(tempSpan);

      const barWidth = bar.offsetWidth;
      const minPercent = (textWidth / barWidth) * 100;
      line.style.width = `${Math.max(currentPercent, minPercent)}%`;
    } else {
      line.style.width = `${currentPercent}%`;
    }
  };

  animate();
});
