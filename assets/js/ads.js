/* Anúncios responsivos: banners de largura fixa (ex.: 728x90, 300x250)
   são escalados proporcionalmente para caber na largura disponível,
   sem quebrar o layout no celular. Funciona para qualquer slot que
   tenha o wrapper <div class="ad__frame" data-w data-h>. */
(function () {
  function fit(box) {
    var frame = box.querySelector('iframe');
    if (!frame) return;
    var w = parseFloat(box.dataset.w) || frame.offsetWidth || 728;
    var h = parseFloat(box.dataset.h) || frame.offsetHeight || 90;
    var scale = Math.min(1, box.clientWidth / w);
    frame.style.transformOrigin = '0 0';
    frame.style.transform = scale < 0.999 ? 'scale(' + scale + ')' : '';
    box.style.maxWidth = w + 'px';
    box.style.height = Math.round(h * scale) + 'px';
  }
  function init() {
    var boxes = document.querySelectorAll('.ad__frame[data-w]');
    boxes.forEach(function (box) {
      fit(box);
      if ('ResizeObserver' in window) {
        new ResizeObserver(function () { fit(box); }).observe(box);
      }
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.addEventListener('load', init);
})();
