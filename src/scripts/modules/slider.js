import Swiper from 'swiper';
// import { Autoplay } from 'swiper/modules';

function initSlider(selector, delay) {
  return new Swiper(selector, {
    // modules: [Autoplay],
    // loop: true,
    speed: 1000,
    slidesPerView: 'auto',
    spaceBetween: 8,
    // autoplay: {
    //   delay,
    //   disableOnInteraction: false,
    // },
  });
}

initSlider('.team-js', 1000);
initSlider('.board-js', 3500);
initSlider('.documents-js', 5000);
