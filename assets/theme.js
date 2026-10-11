(() => {
'use strict';const key='vital-theme-v1',root=document.documentElement;let theme='light';try{const saved=localStorage.getItem(key);if(saved==='dark'||saved==='light')theme=saved;}catch{}root.dataset.theme=theme;
function draw(){document.querySelectorAll('.theme-toggle').forEach(b=>{b.textContent=theme==='dark'?'☀':'☾';b.setAttribute('aria-pressed',String(theme==='dark'));b.setAttribute('aria-label',theme==='dark'?'Activar modo claro':'Activar modo oscuro');b.title=theme==='dark'?'Modo claro':'Modo oscuro';});}
function init(){const header=document.querySelector('.header-inner');if(!header)return;const b=document.createElement('button');b.type='button';b.className='theme-toggle';b.addEventListener('click',()=>{theme=theme==='dark'?'light':'dark';root.dataset.theme=theme;try{localStorage.setItem(key,theme);}catch{}draw();});header.insertBefore(b,header.querySelector('.header-action'));draw();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();window.addEventListener('storage',e=>{if(e.key===key){theme=e.newValue==='dark'?'dark':'light';root.dataset.theme=theme;draw();}});
})();
