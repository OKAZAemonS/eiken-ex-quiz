
// quiz.js — shared logic for all Unit pages
(function(){
  const POOL_KEY = 'vocabPool'; // for cross-unit distractors
  const STORAGE_KEY = 'eiken_app_state_v1'; // reserved for future
  const GENERIC = ['tenure','stature','remedy','parcel','tenet','amenity','levity','sanction','allude','relish','abet','forgo'];

  function getPool(){
    try{ return Array.from(new Set(JSON.parse(localStorage.getItem(POOL_KEY) || "[]"))); }catch{ return []; }
  }
  function setPool(arr){
    localStorage.setItem(POOL_KEY, JSON.stringify(Array.from(new Set(arr))));
  }
  function addToPool(words){
    const pool = getPool();
    setPool(pool.concat(words));
  }
  function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; }
  function uniq(a){ return [...new Set(a)]; }

  function highlightJP(jpSentence, jpWord){
    // Try to bold the target phrase in the JP translation; fall back to appending in () if not found
    const split = /[、，・（）()\s]/g;
    const cands = jpWord.split(split).filter(Boolean).sort((a,b)=>b.length-a.length);
    for(const c of cands){
      const idx = jpSentence.indexOf(c);
      if(idx !== -1){
        return jpSentence.replace(c, "<b>"+c+"</b>");
      }
    }
    return jpSentence + "（<b>"+jpWord+"</b>）";
  }

  function buildChoices(answerWord){
    const pool = getPool().filter(w => w.toLowerCase() !== answerWord.toLowerCase());
    const src = (pool.length >= 3 ? pool : pool.concat(GENERIC));
    const opts = shuffle(uniq([answerWord, ...shuffle(src).slice(0,3)]));
    return opts;
  }

  function makeEl(tag, cls, html){
    const el = document.createElement(tag);
    if(cls) el.className = cls;
    if(html!=null) el.innerHTML = html;
    return el;
  }

  function render(items, order='original'){
    const mount = document.getElementById('quiz');
    mount.innerHTML = '';

    const list = (order === 'shuffle') ? shuffle(items.slice()) : items.slice();
    const total = list.length;

    list.forEach((it,idx)=>{
      const li = makeEl('li','card');
      const num = (idx+1).toString().padStart(3,'0');
      const q = makeEl('div','q', `<span class="num">${num}</span> ${it.sentence.replace('_____', '<span class="blank">_____</span>')}`);

      const choices = makeEl('div','choices');
      const opts = buildChoices(it.word);
      opts.forEach(opt=>{
        const b = makeEl('button','', opt);
        b.addEventListener('click', ()=>{
          if(b.dataset.locked) return;
          const isCorrect = (opt.toLowerCase() === it.word.toLowerCase());
          [...choices.querySelectorAll('button')].forEach(x=>x.disabled = true);
          b.dataset.locked = '1';
          const ans = makeEl('div','answer');
          if(isCorrect){
            // fill in the blank + show JP translation with bold
            q.innerHTML = `<span class="num">${num}</span> ${it.sentence.replace('_____', '<b>'+it.word+'</b>')}`;
            ans.innerHTML = `<div class="jp">${highlightJP(it.jp_sentence, it.jp_word)}</div>`;
          }else{
            b.classList.add('wrong');
            b.insertAdjacentHTML('beforeend',' <span class="wrongmsg">×</span>');
          }
          li.appendChild(ans);
        });
        choices.appendChild(b);
      });

      li.appendChild(q);
      li.appendChild(choices);
      mount.appendChild(li);
    });
  }

  function injectToolbar(){
    const bar = makeEl('div','toolbar');
    const left = makeEl('div','left','');
    const right = makeEl('div','right','');
    const shuffleBtn = makeEl('button','pill','順番をランダムにする');
    const resetBtn = makeEl('button','pill secondary','元の順番に戻す');
    shuffleBtn.addEventListener('click', ()=> render(window.UNIT_ITEMS, 'shuffle'));
    resetBtn.addEventListener('click', ()=> render(window.UNIT_ITEMS, 'original'));
    right.appendChild(shuffleBtn); right.appendChild(resetBtn);
    bar.appendChild(left); bar.appendChild(right);
    const container = document.querySelector('.container');
    container.insertBefore(bar, container.firstChild);
  }

  function ensureStyles(){
    const style = document.createElement('style');
    style.textContent = `
    .toolbar{display:flex;justify-content:space-between;align-items:center;margin:8px 4px 12px;gap:8px;}
    .pill{border:1px solid #0ea5e9;background:#0ea5e9;color:#fff;border-radius:999px;padding:8px 12px;cursor:pointer;}
    .pill.secondary{background:#fff;color:#0ea5e9;}
    .pill:hover{opacity:.95}
    `;
    document.head.appendChild(style);
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    if(!Array.isArray(window.UNIT_ITEMS)){ console.error('UNIT_ITEMS not found'); return; }
    // Register this unit's words into the cross-unit pool
    addToPool(window.UNIT_ITEMS.map(x=>x.word));
    ensureStyles();
    injectToolbar();
    render(window.UNIT_ITEMS, 'original');
  });
})();
