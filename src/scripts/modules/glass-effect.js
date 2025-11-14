document.querySelectorAll('.glass-effect').forEach(glass => {
  const count = 5; // сколько декоративных элементов добавить
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.classList.add('glass-effect__element');
    fragment.prepend(el);
  }

  glass.prepend(fragment);

});
