(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
  var head = document.querySelector('.site-head');

  // Wechselnde Frage im Hero
  var rot = document.getElementById('rotator');
  if (rot && !reduce){
    var items = rot.children, ri = 0, timer;
    var next = function(){
      var cur = items[ri]; cur.classList.remove('on'); cur.classList.add('out');
      ri = (ri + 1) % items.length;
      var nx = items[ri]; nx.classList.remove('out'); void nx.offsetWidth; nx.classList.add('on');
      setTimeout(function(){ cur.classList.remove('out'); }, 600);
    };
    var stop = function(){ if (timer) clearInterval(timer); };
    var start = function(){ stop(); timer = setInterval(next, 2400); };
    document.addEventListener('visibilitychange', function(){ if (document.hidden) stop(); else start(); });
    start();
  }

  // Leichte Tiefe im Hero bei Mausbewegung
  var hp = document.getElementById('heroPanel');
  if (hp && !reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches){
    hp.addEventListener('pointermove', function(e){
      var r = hp.getBoundingClientRect();
      hp.style.setProperty('--mx', ((e.clientX - r.left) / r.width - .5).toFixed(3));
      hp.style.setProperty('--my', ((e.clientY - r.top) / r.height - .5).toFixed(3));
    });
    hp.addEventListener('pointerleave', function(){ hp.style.setProperty('--mx', 0); hp.style.setProperty('--my', 0); });
  }

  // Videos nur abspielen, wenn sichtbar
  [].slice.call(document.querySelectorAll('video[data-autoplay]')).forEach(function(v){
    if (reduce || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function(es){
      es.forEach(function(e){ if (e.isIntersecting){ var p = v.play(); if (p && p.catch) p.catch(function(){}); } else { v.pause(); } });
    }, {threshold:.2}).observe(v);
  });

  // Kundenseiten-Showcase
  var sc = document.getElementById('webseiten'), scSticky = document.getElementById('scSticky'), scScreen = document.getElementById('scScreen');
  var layers = scScreen ? [].slice.call(scScreen.querySelectorAll('.sc-layer')) : [];
  var tabs = [].slice.call(document.querySelectorAll('#scTabs button'));
  var urlEl = document.getElementById('scUrl'), hint = document.getElementById('scHint');
  var curIdx = -1;
  function showcase(){
    if (!sc || !scSticky || reduce || !layers.length) return;
    var r = sc.getBoundingClientRect();
    var total = sc.offsetHeight - scSticky.offsetHeight;
    var p = clamp(-r.top / Math.max(1, total), 0, 1);
    var n = layers.length, f = p * n, i = Math.min(n - 1, Math.floor(f)), sub = p >= 1 ? 1 : f - i;
    var t = clamp((sub - .06) / .84, 0, 1);
    t = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    var sh = scScreen.clientHeight, sw = scScreen.clientWidth;
    layers.forEach(function(L, j){
      var img = L.firstElementChild;
      var ih = img.offsetHeight || (sw * (img.getAttribute('height') || 4800) / (img.getAttribute('width') || 1100));
      var max = Math.max(0, ih - sh);
      var y = j < i ? max : (j > i ? 0 : max * t);
      img.style.transform = 'translate3d(0,' + (-y).toFixed(1) + 'px,0)';
      L.classList.toggle('on', j === i);
      if (tabs[j]){ tabs[j].style.setProperty('--p', j < i ? 1 : (j > i ? 0 : sub.toFixed(3))); tabs[j].classList.toggle('on', j === i); }
    });
    if (i !== curIdx && urlEl){ curIdx = i; var b = tabs[i]; if (b){ urlEl.textContent = b.getAttribute('data-url'); urlEl.href = b.getAttribute('data-href'); } }
    if (hint) hint.classList.toggle('gone', p > .02);
  }
  tabs.forEach(function(b){
    b.addEventListener('click', function(){
      var i = +b.getAttribute('data-i');
      var top = sc.getBoundingClientRect().top + window.scrollY;
      var total = sc.offsetHeight - scSticky.offsetHeight;
      window.scrollTo({top: top + total * (i / layers.length) + 2, behavior: reduce ? 'auto' : 'smooth'});
    });
  });

  // Film wächst auf volle Breite
  var fb = document.getElementById('filmBleed');
  function film(){
    if (!fb || reduce) return;
    var r = fb.getBoundingClientRect(), vh = window.innerHeight;
    var p = clamp((vh - r.top) / (vh * .75), 0, 1);
    fb.style.setProperty('--k', (1 - p).toFixed(3));
  }

  // Schlusszeilen laufen gegeneinander
  var band = document.getElementById('band'), r1 = document.getElementById('bandR1'), r2 = document.getElementById('bandR2');
  function bandMove(){
    if (!band || reduce) return;
    var r = band.getBoundingClientRect(), vh = window.innerHeight;
    var p = clamp((vh - r.top) / (vh + r.height), 0, 1);
    r1.style.transform = 'translate3d(' + (-p * 30).toFixed(2) + '%,0,0)';
    r2.style.transform = 'translate3d(' + (-30 + p * 26).toFixed(2) + '%,0,0)';
  }

  var ticking = false;
  function onScroll(){
    if (ticking) return; ticking = true;
    requestAnimationFrame(function(){
      ticking = false;
      if (head) head.classList.toggle('scrolled', window.scrollY > 8);
      showcase(); film(); bandMove();
    });
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll);
  layers.forEach(function(L){ L.firstElementChild.addEventListener('load', onScroll); });
  onScroll();

  // Referenzen nach Branche filtern
  var refBox = document.getElementById('refs');
  if (refBox){
    var cards = [].slice.call(refBox.querySelectorAll('.ref'));
    [].slice.call(document.querySelectorAll('.filters button')).forEach(function(b){
      b.addEventListener('click', function(){
        var f = b.getAttribute('data-f');
        [].slice.call(document.querySelectorAll('.filters button')).forEach(function(x){ x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        cards.forEach(function(c){ c.hidden = !(f === 'alle' || c.getAttribute('data-branche') === f); });
      });
    });
  }
})();
