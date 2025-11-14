document.querySelectorAll('.card-item__result-chart').forEach(chartWrap => {
  const total = Number(chartWrap.dataset.total);
  const chart = chartWrap.querySelector('.vote-chart');
  const segments = chart.querySelectorAll('.chart-segment');
  const totalLabel = chartWrap.querySelector('.chart-label strong');
  const listItems = chartWrap.querySelectorAll('ul li');

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  let sum = 0;

  // Расчёт кругов
  segments.forEach(segment => {
    const value = Number(segment.dataset.value);
    const percent = value / total;
    const gap = 4;
    const length = circumference * percent - gap;

    segment.style.strokeDasharray = `${length} ${circumference - length}`;
    segment.style.strokeDashoffset = -offset;
    offset += length + gap; 

    sum += value;
  });

  // Обновляем центральное число
  if (totalLabel) totalLabel.textContent = sum.toLocaleString('ru-RU');

  // Заполняем список справа
  listItems.forEach(item => {
    const cls = [...item.classList].find(c => ['supported', 'against', 'abstained'].includes(c));
    const seg = chart.querySelector(`.chart-segment.${cls}`);
    if (!seg) return;

    const value = Number(seg.dataset.value);
    const percent = ((value / total) * 100).toFixed(1).replace('.', ',');
    const formattedValue = value.toLocaleString('ru-RU');

    const span = item.querySelector('span');
    span.textContent = `${formattedValue} (${percent}%)`;
  });
});
