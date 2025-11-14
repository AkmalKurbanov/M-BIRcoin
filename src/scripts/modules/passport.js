document.addEventListener('DOMContentLoaded', () => {
  const uploadInputs = document.querySelectorAll('.upload-input');

  uploadInputs.forEach(input => {
    const card = input.closest('.upload-card');
    const imgDefault = card.querySelector('.upload-card__img-default');
    const imgPreview = card.querySelector('.upload-card__preview');
    const text = card.querySelector('.upload-card__text');
    const removeBtn = card.querySelector('.upload-remove');

    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = e => {
        
        imgDefault.style.display = 'none';
        text.style.display = 'none';
        card.classList.add('has-file');

      
        let previewImg = imgPreview.querySelector('img');
        if (!previewImg) {
          previewImg = document.createElement('img');
          imgPreview.appendChild(previewImg);
        }
        previewImg.src = e.target.result;
        previewImg.classList.add('upload-card__img');
      };
      reader.readAsDataURL(file);
    });

    removeBtn.addEventListener('click', e => {
      e.preventDefault();

      input.value = '';
      imgPreview.innerHTML = ''; 
      imgDefault.style.display = '';
      text.style.display = '';
      card.classList.remove('has-file');
    });
  });
});
