document.addEventListener('DOMContentLoaded', () => {
  const copyButtons = document.querySelectorAll('.copy-value-js');
  if (!copyButtons.length) return;

  copyButtons.forEach(button => {
    const container = button.closest('.input__flex-container');
    const input = container?.querySelector('.copied-js');
    if (!input) return;

    let canCopy = true;

    const copy = async () => {
      if (!canCopy) return;

      const value = input.value.trim();
      if (!value) return;

      try {
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(value);
        } else {
          
          const temp = document.createElement('textarea');
          temp.value = value;
          temp.setAttribute('readonly', '');
          temp.style.position = 'absolute';
          temp.style.left = '-9999px';
          document.body.appendChild(temp);
          temp.select();
          document.execCommand('copy');
          document.body.removeChild(temp);
        }


        button.classList.add('copied');
        canCopy = false;
        setTimeout(() => {
          button.classList.remove('copied');
          canCopy = true;
        }, 2000);
      } catch (err) {
        console.error('Ошибка копирования:', err);
      }
    };

    button.addEventListener('click', copy);
  });
});
