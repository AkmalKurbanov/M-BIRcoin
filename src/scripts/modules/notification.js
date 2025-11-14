document.addEventListener('click', (e) => {
  const trigger = e.target.closest('.trigger-js');
  const close = e.target.closest('.close-js');
  const body = document.body;


  if (trigger) {
    e.preventDefault();
    const triggerDataName = trigger.getAttribute('data-name');


    document.querySelectorAll('.trigger-js').forEach(el => {
      el.classList.toggle('active', el === trigger);
    });

    
    let isAnyShown = false;
    document.querySelectorAll('.called-js').forEach(el => {
      const calledDataName = el.getAttribute('data-name');
      const show = calledDataName === triggerDataName;
      el.classList.toggle('show', show);
      if (show) isAnyShown = true;
    });

   
    body.style.overflow = isAnyShown ? 'hidden' : '';
  }


  if (close) {
    e.preventDefault();

    document.querySelectorAll('.trigger-js').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.called-js').forEach(el => el.classList.remove('show'));

    
    body.style.overflow = '';
  }
});









