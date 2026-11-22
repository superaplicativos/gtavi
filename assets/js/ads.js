/* Anúncios responsivos: banners de largura fixa (ex.: 300x250, 728x90)
   são escalados proporcionalmente para caber na largura disponível,
   sem cortar nem quebrar o layout no celular.

   Redes de anúncio costumam injetar o iframe DEPOIS que a página
   carrega, por isto cada slot é observado continuamente
   (MutationObserver + ResizeObserver + eventos de load do iframe). */
(function () {
  function fit(box) {
    var frame = box.querySelector('iframe');
    if (!frame) return;
    var w = parseFloat(box.dataset.w) || frame.offsetWidth || 728;
    var h = parseFloat(box.dataset.h) || frame.offsetHeight || 90;
    var scale = Math.min(1, box.clientWidth / w);
    frame.style.transformOrigin = '0 0';
    frame.style.transform = scale < 0.999 ? 'scale(' + scale + ')' : '';
    box.style.height = Math.round(h * scale) + 'px';
  }
  function watch(box) {
    fit(box);
    if ('ResizeObserver' in window) {
      new ResizeObserver(function () { fit(box); }).observe(box);
    }
    /* iframe injetado tarde demais? observa o slot e re-ajusta */
    if ('MutationObserver' in window) {
      new MutationObserver(function () { fit(box); }).observe(box, { childList: true, subtree: true });
    }
  }
  function init() {
    document.querySelectorAll('.ad__frame[data-w]').forEach(watch);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.addEventListener('load', init);
  /* eventos "load" de iframes não borbulham, mas chegam em capture:
     re-ajusta sempre que o criativo de um banner termina de carregar */
  document.addEventListener('load', function (e) {
    if (e.target && e.target.tagName === 'IFRAME') {
      var box = e.target.closest('.ad__frame');
      if (box) fit(box);
    }
  }, true);
})();
