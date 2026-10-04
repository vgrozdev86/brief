'use strict';
/* Типографика русского текста: убирает «висячие» предлоги и цифры в конце строки.
   Ставит неразрывный пробел:
   — после коротких слов и предлогов (в, на, и, с, по, для, при …), чтобы они не оставались в конце строки;
   — вокруг чисел и дат, чтобы число всегда стояло рядом со словом, а не одно в конце строки;
   — перед тире. Работает по тексту на странице, на вводимые ответы не влияет.
   Применяется сразу и автоматически к тексту, который сайт добавляет позже (этапы, финал, уведомления). */
(function () {
  var NB = ' ';
  // любое слово из 1–3 русских букв (в, на, и, не, их, что, как, для, при …) не остаётся в конце строки
  var RE_SHORT = /(^|[^\p{L}\p{N}])([а-яё]{1,3})[ \t\n\r]+/giu;
  // частицы «бы, ли, же» стоят вплотную к предыдущему слову
  var RE_PARTICLE = /[ \t\n\r]+(?=(?:бы|ли|же|ль)(?![\p{L}\p{N}]))/giu;
  // разделитель «·» не отрывается от слова перед ним
  var RE_DOT = /[ \t\n\r]+(?=·)/g;
  var RE_BEFORE_NUM = /[ \t\n\r]+(?=[\d№])/g;
  var RE_AFTER_NUM = /(\d[\d.,:–\-/]*)[ \t\n\r]+/g;
  var RE_BEFORE_DASH = /[ \t\n\r]+(?=—)/g;
  var SKIP = 'script,style,textarea,input,[data-notypo]';

  function fix(s) {
    var out = s;
    for (var i = 0; i < 3; i++) out = out.replace(RE_SHORT, '$1$2' + NB); // несколько проходов для цепочек «и на их»
    out = out.replace(RE_PARTICLE, NB).replace(RE_DOT, NB);
    out = out.replace(/(^|[^\p{L}\p{N}])(то|тот|та|те|тех),[ \t\n\r]+(?=что|чтобы|как)/giu, '$1$2,' + NB); // «то, что» вместе
    out = out.replace(/([\p{L}\d])–([\p{L}\d])/gu, '$1⁠–⁠$2'); // «15–20», «три–пять» не рвём по тире
    out = out.replace(RE_BEFORE_NUM, NB).replace(RE_AFTER_NUM, '$1' + NB).replace(RE_BEFORE_DASH, NB);
    return out;
  }

  function typo(root) {
    root = root || document.body;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var n;
    while ((n = w.nextNode())) {
      var p = n.parentElement;
      if (!p || p.closest(SKIP)) continue;
      var v = fix(n.nodeValue);
      if (v !== n.nodeValue) n.nodeValue = v; // меняем только если есть что менять, цикла нет
    }
  }

  window.typo = typo;
  typo(document.body);

  // текст, который сайт дорисовывает сам (этапы, финал, уведомления)
  new MutationObserver(function (list) {
    list.forEach(function (m) {
      m.addedNodes.forEach(function (node) {
        if (node.nodeType === 1) typo(node);
        else if (node.nodeType === 3 && node.parentElement && !node.parentElement.closest(SKIP)) {
          var v = fix(node.nodeValue);
          if (v !== node.nodeValue) node.nodeValue = v;
        }
      });
    });
  }).observe(document.body, { childList: true, subtree: true });
})();
