(() => {
  'use strict';
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const KEY = 'vital-wellbeing-v1';
  const today = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  const empty = () => ({ version: 1, days: {}, sessions: [], shopping: [], sleep: null });
  let state = empty();
  let storageAvailable = true;
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      state.days = parsed.days && typeof parsed.days === 'object' && !Array.isArray(parsed.days) ? parsed.days : {};
      state.sessions = Array.isArray(parsed.sessions) ? parsed.sessions.filter(s => s && ['breath', 'activity', 'sleep', 'mood'].includes(s.type) && typeof s.date === 'string').slice(-200) : [];
      state.shopping = Array.isArray(parsed.shopping) ? parsed.shopping.filter(s => s && typeof s.name === 'string').map(s => ({ name: s.name.slice(0, 120), checked: !!s.checked })).slice(0, 100) : [];
      if (parsed.sleep && /^\d\d:\d\d$/.test(parsed.sleep.bed) && /^\d\d:\d\d$/.test(parsed.sleep.wake)) state.sleep = parsed.sleep;
    }
  } catch { storageAvailable = false; }
  function day() {
    const key = today();
    if (!state.days[key] || typeof state.days[key] !== 'object' || Array.isArray(state.days[key])) state.days[key] = {};
    const current = state.days[key];
    if (!current.habits || typeof current.habits !== 'object') current.habits = {};
    if (!current.sleepSteps || typeof current.sleepSteps !== 'object') current.sleepSteps = {};
    return current;
  }
  let toastTimeout;
  function toast(text) {
    const target = $('#toast');
    if (!target) return;
    target.textContent = text;
    target.hidden = false;
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => { target.hidden = true; }, 5000);
  }
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      storageAvailable = true;
      return true;
    } catch {
      storageAvailable = false;
      toast('El navegador no permite guardar. Tus cambios solo estarán disponibles durante esta visita.');
      return false;
    }
  }
  function record(type, label, extra = {}) {
    state.sessions.push({ type, label, date: today(), at: new Date().toISOString(), ...extra });
    state.sessions = state.sessions.slice(-200);
    return save();
  }
  function download(name, data, mime) {
    const blob = new Blob([data], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const toggle = $('#menuToggle');
  const nav = $('#mainNav');
  function closeMenu() {
    nav?.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
    toggle?.setAttribute('aria-label', 'Abrir menú');
    if (toggle) toggle.textContent = '☰';
  }
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    toggle.textContent = open ? '×' : '☰';
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  document.addEventListener('click', event => { if (nav?.classList.contains('open') && !event.target.closest('.site-header')) closeMenu(); });
  $$('nav a').forEach(a => a.addEventListener('click', closeMenu));
  window.addEventListener('pageshow', event => { if (event.persisted) window.location.reload(); });

  if ($('#saveMood')) {
    let selected = typeof day().mood === 'string' ? day().mood : '';
    const draw = () => {
      $$('[data-mood]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mood === selected)));
      $('#saveMood').disabled = !selected;
      $('#savedMood').textContent = day().mood ? `Tu último registro de hoy: ${day().mood}.` : 'Aún no has guardado un registro hoy.';
    };
    $$('[data-mood]').forEach(button => button.addEventListener('click', () => { selected = button.dataset.mood; draw(); }));
    $('#saveMood').addEventListener('click', () => {
      if (!selected) return;
      day().mood = selected;
      day().habits.mente = true;
      const persisted = record('mood', selected);
      $('#moodStatus').textContent = persisted ? 'Registro guardado. Gracias por darte este momento.' : 'Registro disponible durante esta visita; no se pudo guardar.';
      draw();
    });
    draw();
  }
  if ($('#breathStart')) {
    let elapsed = 0, active = false, tick = null, base = 0;
    function drawBreath() {
      const cycle = elapsed % 10;
      const inhale = cycle < 4;
      $('#breathOrb').classList.toggle('expand', active && inhale);
      $('#breathPhase').textContent = elapsed >= 60 ? 'Bien hecho' : active ? inhale ? 'Inhala' : 'Exhala' : elapsed ? 'En pausa' : 'A tu ritmo';
      $('#breathMeta').textContent = elapsed >= 60 ? 'Pausa completada · 60 segundos' : active || elapsed ? `${60 - elapsed} segundos restantes · sin retener el aire` : 'Una pausa de 60 segundos';
      $('#breathStart').textContent = elapsed >= 60 ? 'Nueva pausa ↗' : active ? 'Pausar' : elapsed ? 'Continuar ↗' : 'Iniciar pausa ↗';
    }
    function stop() { clearInterval(tick); tick = null; active = false; }
    $('#breathStart').addEventListener('click', () => {
      if (active) { stop(); drawBreath(); return; }
      if (elapsed >= 60) elapsed = 0;
      active = true;
      base = Date.now() - elapsed * 1000;
      drawBreath();
      tick = setInterval(() => {
        elapsed = Math.min(60, Math.floor((Date.now() - base) / 1000));
        if (elapsed >= 60) {
          stop(); day().habits.mente = true;
          const persisted = record('breath', 'Pausa de respiración', { seconds: 60 });
          toast(persisted ? 'Pausa completada y guardada en Mi espacio.' : 'Pausa completada. El navegador no permitió guardarla.');
        }
        drawBreath();
      }, 200);
    });
    $('#breathReset').addEventListener('click', () => { stop(); elapsed = 0; drawBreath(); });
    window.addEventListener('pagehide', stop);
  }
  if ($('#timerStart')) {
    let total = Number($('#activityDuration').value), remaining = total, active = false, end = 0, tick = null;
    const tips = { Caminata: 'Busca un recorrido seguro y camina a un ritmo cómodo.', Movilidad: 'Realiza movimientos suaves dentro de un rango cómodo, sin forzarte.', 'Pausa activa': 'Cambia de posición y muévete de forma cómoda en un espacio seguro.' };
    function drawTimer() {
      $('#timerDigits').textContent = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;
      $('#timerStart').textContent = !remaining ? 'Nueva sesión ↗' : active ? 'Pausar' : remaining < total ? 'Continuar ↗' : 'Iniciar ↗';
      $('#activityDuration').disabled = active || remaining < total && remaining > 0;
      $('#activityType').disabled = active || remaining < total && remaining > 0;
      $('#timerCaption').textContent = !remaining ? 'Sesión completada' : active ? 'A tu propio ritmo' : remaining < total ? 'Tu sesión está en pausa' : 'Listo cuando tú lo estés';
      $('#activityTip').textContent = tips[$('#activityType').value];
    }
    function stop() { clearInterval(tick); active = false; tick = null; }
    function reset() { stop(); total = Number($('#activityDuration').value); remaining = total; $('#timerStatus').textContent = ''; drawTimer(); }
    $('#activityDuration').addEventListener('change', reset);
    $('#activityType').addEventListener('change', drawTimer);
    $('#timerReset').addEventListener('click', reset);
    $('#timerStart').addEventListener('click', () => {
      if (active) { remaining = Math.max(0, Math.ceil((end - Date.now()) / 1000)); stop(); drawTimer(); return; }
      if (!remaining) reset();
      active = true; end = Date.now() + remaining * 1000; drawTimer();
      tick = setInterval(() => {
        remaining = Math.max(0, Math.ceil((end - Date.now()) / 1000));
        if (!remaining) {
          stop(); day().habits.movimiento = true;
          const persisted = record('activity', $('#activityType').value, { minutes: total / 60 });
          $('#timerStatus').textContent = persisted ? 'Sesión terminada y guardada en Mi espacio.' : 'Sesión terminada. No se pudo guardar en este navegador.';
        }
        drawTimer();
      }, 200);
    });
    window.addEventListener('pagehide', stop);
    drawTimer();
  }
  const sleepMinutes = (bed, wake) => {
    const parts = text => /^([01]\d|2[0-3]):[0-5]\d$/.test(text) ? Number(text.slice(0, 2)) * 60 + Number(text.slice(3)) : NaN;
    const difference = (parts(wake) - parts(bed) + 1440) % 1440;
    return difference;
  };
  const durationText = minutes => {
    if (!Number.isFinite(minutes)) return '—';
    return `${Math.floor(minutes / 60)} h${minutes % 60 ? ` ${minutes % 60} min` : ''}`;
  };
  if ($('#sleepForm')) {
    if (state.sleep) { $('#bedTime').value = state.sleep.bed; $('#wakeTime').value = state.sleep.wake; }
    const drawSleep = () => {
      const minutes = sleepMinutes($('#bedTime').value, $('#wakeTime').value);
      $('#sleepDuration').textContent = durationText(minutes);
      $('#sleepStatus').textContent = minutes === 0 ? 'Elige horas diferentes para calcular el intervalo.' : '';
    };
    $('#bedTime').addEventListener('input', drawSleep);
    $('#wakeTime').addEventListener('input', drawSleep);
    $('#sleepForm').addEventListener('submit', event => {
      event.preventDefault();
      const bed = $('#bedTime').value, wake = $('#wakeTime').value, minutes = sleepMinutes(bed, wake);
      if (!Number.isFinite(minutes) || minutes === 0) { $('#sleepStatus').textContent = 'Introduce dos horarios válidos y diferentes.'; return; }
      state.sleep = { bed, wake, minutes };
      const persisted = record('sleep', `Horario ${bed}–${wake}`, { minutes });
      $('#sleepStatus').textContent = persisted ? `Horario guardado: ${durationText(minutes)} de tiempo disponible.` : 'Horario disponible durante esta visita; no se pudo guardar.';
    });
    function drawSteps() {
      let completed = 0;
      $$('[data-sleep-step]').forEach(input => { input.checked = !!day().sleepSteps[input.dataset.sleepStep]; if (input.checked) completed++; });
      $('#sleepProgress').style.width = `${completed * 25}%`;
      $('#sleepChecklistStatus').textContent = `${completed} de 4 pasos completados`;
    }
    $$('[data-sleep-step]').forEach(input => input.addEventListener('change', () => {
      day().sleepSteps[input.dataset.sleepStep] = input.checked;
      day().habits.descanso = $$('[data-sleep-step]').every(item => !!day().sleepSteps[item.dataset.sleepStep]);
      save(); drawSteps();
    }));
    drawSleep(); drawSteps();
  }
  if ($('#recipeDialog')) {
    let recipes = [], selected = null;
    const dialog = $('#recipeDialog');
    const close = () => dialog.close();
    $$('[data-close-dialog]').forEach(button => button.addEventListener('click', close));
    dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close(); } });
    $$('[data-filter]').forEach(button => button.addEventListener('click', () => {
      $$('[data-filter]').forEach(chip => chip.setAttribute('aria-pressed', String(chip === button)));
      $$('.recipe').forEach(card => { card.hidden = button.dataset.filter !== 'todas' && card.dataset.category !== button.dataset.filter; });
    }));
    function listItems(target, items) {
      target.replaceChildren();
      items.forEach(text => { const item = document.createElement('li'); item.textContent = text; target.append(item); });
    }
    const recipeReady = fetch('assets/recipes.json').then(response => { if (!response.ok) throw new Error('recipes'); return response.json(); }).then(data => { recipes = data; }).catch(() => { toast('No se pudieron cargar las recetas. Recarga la página para intentarlo de nuevo.'); });
    $$('[data-recipe]').forEach(button => button.addEventListener('click', async () => {
      await recipeReady;
      selected = recipes.find(recipe => recipe.id === button.dataset.recipe);
      if (!selected) { toast('La receta no está disponible en este momento.'); return; }
      $('#recipeTitle').textContent = selected.name;
      $('#recipeDescription').textContent = selected.desc;
      $('#recipeImage').src = selected.image;
      $('#recipeImage').alt = selected.imageAlt;
      $('#recipeImage').hidden = false;
      $('#recipeMeta').textContent = selected.category;
      $('#recipeTime').textContent = selected.time;
      $('#recipeServings').textContent = `${selected.servings} ${selected.servings === 1 ? 'porción' : 'porciones'}`;
      $('#recipeNote').textContent = selected.note;
      listItems($('#recipeIngredients'), selected.ingredients);
      listItems($('#recipeSteps'), selected.steps);
      $('#addIngredients').textContent = 'Añadir a mi lista +';
      dialog.showModal();
      dialog.scrollTop = 0;
    }));
    function drawShopping() {
      const target = $('#shoppingList'); target.replaceChildren();
      if (!state.shopping.length) { const p = document.createElement('p'); p.textContent = 'Tu lista está vacía. Añade ingredientes desde una receta.'; p.className = 'empty-state'; target.append(p); }
      state.shopping.forEach((entry, index) => {
        const label = document.createElement('label'), input = document.createElement('input'), span = document.createElement('span');
        input.type = 'checkbox'; input.checked = !!entry.checked; span.textContent = entry.name;
        input.addEventListener('change', () => { state.shopping[index].checked = input.checked; save(); });
        label.append(input, span); target.append(label);
      });
      $('#downloadShopping').disabled = !state.shopping.length;
      $('#clearShopping').disabled = !state.shopping.length;
    }
    $('#addIngredients').addEventListener('click', () => {
      if (!selected) return;
      selected.ingredients.forEach(name => { if (!state.shopping.some(entry => entry.name === name)) state.shopping.push({ name, checked: false }); });
      const persisted = save(); drawShopping();
      $('#addIngredients').textContent = 'Ingredientes añadidos ✓';
      toast(persisted ? 'Ingredientes guardados en tu lista de compras.' : 'Ingredientes añadidos para esta visita; no se pudieron guardar.');
    });
    $('#downloadShopping').addEventListener('click', () => { if (state.shopping.length) download('VITAL-lista-de-compras.txt', 'VITAL · Mi lista de compras\n\n' + state.shopping.map(entry => `${entry.checked ? '[x]' : '[ ]'} ${entry.name}`).join('\n'), 'text/plain;charset=utf-8'); });
    $('#clearShopping').addEventListener('click', () => { state.shopping = []; save(); drawShopping(); $('#shoppingStatus').textContent = 'Lista vaciada.'; });
    drawShopping();
  }
  if ($('#todayCount')) {
    const labels = { mente: 'Mente', movimiento: 'Movimiento', alimentacion: 'Alimentación', descanso: 'Descanso' };
    function renderSpace() {
      const current = day(), sessions = state.sessions.filter(session => session.date === today());
      $('#todayDate').textContent = new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });
      const count = Object.keys(labels).filter(key => !!current.habits[key]).length;
      $('#todayCount').textContent = `${count}/4`;
      $('#breathCount').textContent = String(sessions.filter(session => session.type === 'breath').length);
      const activityMinutes = sessions.filter(session => session.type === 'activity').reduce((sum, session) => sum + (Number(session.minutes) || 0), 0);
      $('#activityCount').textContent = String(activityMinutes);
      $('#sleepStat').textContent = state.sleep ? durationText(sleepMinutes(state.sleep.bed, state.sleep.wake)) : '—';
      $('#detail-mente').textContent = current.mood ? `Tu registro de hoy: ${current.mood}.` : 'Puedes registrar tu estado de ánimo en Mente.';
      $('#detail-movimiento').textContent = activityMinutes ? `Hoy terminaste ${activityMinutes} minutos de actividad.` : 'Prueba el temporizador en Movimiento.';
      $('#detail-alimentacion').textContent = state.shopping.length ? `${state.shopping.length} ingredientes en tu lista de compras.` : 'Encuentra ideas y crea tu lista de compras.';
      $('#detail-descanso').textContent = state.sleep ? `Tu horario: ${state.sleep.bed}–${state.sleep.wake}.` : 'Organiza tu horario en Descanso.';
      $$('[data-habit]').forEach(input => { input.checked = !!current.habits[input.dataset.habit]; });
      const strip = $('#weekStrip'); strip.replaceChildren();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(); date.setHours(12, 0, 0, 0); date.setDate(date.getDate() - i);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const habits = state.days[key]?.habits || {}, done = Object.keys(labels).filter(name => !!habits[name]).length;
        const item = document.createElement('div'); item.className = `week-day${done ? ' active' : ''}`;
        const caption = document.createElement('span'); caption.textContent = date.toLocaleDateString('es', { weekday: 'short' });
        const value = document.createElement('b'); value.textContent = `${done}/4`;
        const number = document.createElement('span'); number.textContent = date.getDate();
        item.append(caption, value, number); strip.append(item);
      }
      const list = $('#historyList'); list.replaceChildren();
      state.sessions.slice(-7).reverse().forEach(session => {
        const li = document.createElement('li'), name = document.createElement('span'), when = document.createElement('span');
        name.textContent = `${session.label}${session.type === 'activity' ? ` · ${session.minutes} min` : ''}`;
        const date = new Date(session.at);
        when.textContent = Number.isFinite(date.getTime()) ? date.toLocaleDateString('es', { day: 'numeric', month: 'short' }) : session.date;
        li.append(name, when); list.append(li);
      });
      $('#historyEmpty').hidden = !!state.sessions.length;
    }
    $$('[data-habit]').forEach(input => input.addEventListener('change', () => { day().habits[input.dataset.habit] = input.checked; save(); renderSpace(); }));
    $('#exportData').addEventListener('click', () => download(`VITAL-registros-${today()}.json`, JSON.stringify(state, null, 2), 'application/json'));
    const dialog = $('#deleteDialog');
    $('#openDelete').addEventListener('click', () => dialog.showModal());
    $$('[data-close-delete]').forEach(button => button.addEventListener('click', () => dialog.close()));
    $('#confirmDelete').addEventListener('click', () => {
      try { localStorage.removeItem(KEY); } catch { toast('No se pudo acceder al almacenamiento del navegador.'); }
      state = empty(); dialog.close(); renderSpace();
      $('#spaceStatus').textContent = 'Los registros de VITAL se han eliminado de esta visita y del almacenamiento accesible.';
    });
    renderSpace();
    window.addEventListener('pageshow', renderSpace);
    setInterval(renderSpace, 60000);
  }
  if (!storageAvailable) toast('El almacenamiento del navegador no está disponible. Los registros pueden no conservarse.');
})();
