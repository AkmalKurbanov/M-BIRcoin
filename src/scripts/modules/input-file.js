document.addEventListener('DOMContentLoaded', () => {
  const fileInputs = document.querySelectorAll('.input__field--file input[type="file"]');

  fileInputs.forEach(input => {
    const wrapper = input.closest('.input__field--file');
    const nameBox = wrapper.querySelector('.input__file-name');
    const btnBox = wrapper.querySelector('.input__file-btn');

    input.addEventListener('change', () => {
      const files = input.files;

      if (files.length > 0) {
        const count = files.length;
        const firstName = files[0].name;
        const label = count === 1 ? 'файл' : (count >= 2 && count <= 4 ? 'файла' : 'файлов');

        if (count === 1) {
          nameBox.textContent = firstName;
        } else {
          const remaining = count - 1;
          nameBox.textContent = `${firstName} и ещё ${remaining} ${label}`;
        }

        btnBox.textContent = 'Выбрать другой';
      } else {
        nameBox.textContent = 'Файл не выбран';
        btnBox.textContent = 'Выберите файл';
      }
    });
  });
});
