(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  if (!$('#trainingStudio')) return;
  const exercises = {
    march: ['Marcha en el sitio', 'Eleva una rodilla y después la otra. Mantén el torso erguido y respira con normalidad.', 'Menor intensidad: eleva menos las rodillas.'],
    side: ['Pasos laterales', 'Da un paso corto hacia un lado y acerca el otro pie. Alterna sin cruzar las piernas.', 'Menor intensidad: reduce la distancia de cada paso.'],
    heel: ['Elevación de talones', 'Eleva ambos talones lentamente y baja con control. Mantén los pies paralelos.', 'Puedes apoyarte en una superficie estable; si necesitas apoyo, deja las pesas.'],
    squat: ['Sentadilla', 'Pies al ancho de hombros. Lleva la cadera atrás, flexiona las rodillas y vuelve con control; conserva la espalda estable.', 'Menor intensidad: reduce la profundidad o usa una silla estable como referencia.'],
    curl: ['Curl de bíceps', 'Palmas hacia delante, codos cerca del torso. Flexiona y baja lentamente sin balancearte.', 'Menor intensidad: usa menos peso o practica sin mancuernas.']
  };
  const routines = {
    movilidad: {name:'Activa tu cuerpo',list:['march','side','heel'],rounds:1,work:60,rest:0,warm:60,cool:60},
    fuerza: {name:'Fuerza esencial',list:['squat','heel','side'],rounds:2,work:40,rest:40,warm:60,cool:60},
    cardio: {name:'Cardio sin saltos',list:['march','side','heel'],rounds:3,work:50,rest:30,warm:120,cool:60},
    gym: {name:'Pesas / Gym',list:['squat','curl','heel'],rounds:2,work:40,rest:60,warm:180,cool:120,weights:true}
  };
  let routine, phases=[], index=0, elapsed=0, spent=0, active=false, finished=false, last=0, timer=null, motion=true;
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (reduced) motion=false;
  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.ceil(s%60)).padStart(2,'0')}`;
  function pause(){ if(active) advance(); active=false; clearInterval(timer);timer=null;draw(); }
  function select(id){
    pause(); routine=routines[id]; phases=[{id:'march',name:'Calentamiento sin pesas',seconds:routine.warm}];
    for(let r=1;r<=routine.rounds;r++) for(const id of routine.list){
      phases.push({id,name:exercises[id][0]+(routine.weights?' · con mancuernas':''),seconds:routine.work,round:r,weights:!!routine.weights});
      if(routine.rest)phases.push({id:'rest',name:'Descanso',seconds:routine.rest});
    }
    phases.push({id:'march',name:'Vuelta a la calma sin pesas',seconds:routine.cool});
    index=0;elapsed=0;spent=0;finished=false;
    $('#trainingStudio').hidden=false;$('#workoutStatus').textContent='';$('#workoutLabel').textContent=routine.name;
    $('#workoutPlan').replaceChildren(...phases.map(p=>{const li=document.createElement('li');li.textContent=`${p.name}${p.round?' / vuelta '+p.round:''} · ${fmt(p.seconds)}`;return li;}));
    document.querySelectorAll('[data-workout]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.workout===id)));
    draw();$('#trainingStudio').scrollIntoView?.({behavior:reduced?'instant':'smooth',block:'start'});
  }
  function complete(){
    active=false;finished=true;clearInterval(timer);timer=null;
    const minutes=Math.round(spent/60*10)/10;
    $('#workoutStatus').textContent=minutes>0?'Sesión completada.':'Recorrido finalizado; inicia una sesión para registrar actividad.';
    if(minutes>0) document.dispatchEvent(new CustomEvent('vital-workout-complete',{detail:{label:routine.name,minutes}}));
  }
  function advance(){
    const now=Date.now();let delta=Math.max(0,(now-last)/1000);last=now;
    // A hidden tab pauses the session rather than crediting unattended time.
    while(delta>0&&!finished){const amount=Math.min(delta,phases[index].seconds-elapsed);elapsed+=amount;spent+=amount;delta-=amount;
      if(elapsed>=phases[index].seconds){if(index===phases.length-1){complete();break;}index++;elapsed=0;}}
  }
  function draw(){
    if(!routine)return;const p=phases[index];const e=exercises[p.id];
    $('#exerciseName').textContent=finished?'Sesión completada':p.name;
    $('#exerciseCue').textContent=p.id==='rest'?'Relaja los brazos, respira y prepara el siguiente ejercicio.':p===phases[0]||index===phases.length-1?'Camina suavemente en el sitio, sin pesas. Ajusta el ritmo a tu comodidad.':e[1];
    $('#exerciseAlternative').textContent=p.id==='rest'?'Amplía el descanso con Pausar si lo necesitas.':e[2];
    $('#workoutClock').textContent=finished?'00:00':fmt(Math.max(0,Math.ceil(p.seconds-elapsed)));
    $('#workoutPhase').textContent=finished?'Completada':active?(p.id==='rest'?'Recuperación':'En movimiento'):elapsed||index?'En pausa':'Lista para comenzar';
    $('#workoutStart').textContent=finished?'Repetir rutina ↗':active?'Pausar':elapsed||index?'Continuar ↗':'Iniciar rutina ↗';
    $('#workoutNext').disabled=finished;$('#workoutStep').textContent=`Bloque ${index+1} de ${phases.length}${p.round?' · Vuelta '+p.round+' de '+routine.rounds:''}`;
    const percent=finished?100:Math.round((phases.slice(0,index).reduce((n,p)=>n+p.seconds,0)+elapsed)/phases.reduce((n,p)=>n+p.seconds,0)*100);
    $('#workoutProgress').style.width=percent+'%';$('#workoutProgress').parentElement.setAttribute('aria-valuenow',percent);
    [...$('#workoutPlan').children].forEach((li,i)=>{li.classList.toggle('current',i===index);if(i===index)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');});
    $('#motionToggle').setAttribute('aria-pressed',String(motion));$('#motionToggle').textContent=motion?'Animación: activa':'Animación: estática';
    $('#figureTitle').textContent=p.id==='rest'?'Figura en descanso':`Demostración esquemática: ${p.name}`;
    figure();
  }
  function figure(){
    if(!routine)return;const p=phases[index];const wave=motion&&(!elapsed&&!index||active)?(1-Math.cos(Date.now()/650))/2:0;
    let y=0, head=[180,62], shoulders=[[151,103],[209,103]], hip=[[164,184],[196,184]], elbows=[[144,144],[216,144]], hands=[[143,184],[217,184]], knees=[[158,232],[202,232]], feet=[[150,282],[210,282]];
    if(p.id==='squat'){y=wave*35;hip=[[156,184+y],[204,184+y]];knees=[[139,244],[221,244]];if(!p.weights)hands=[[137,120],[223,120]];}
    if(p.id==='curl'){hands=[[143+wave*8,184-wave*66],[217-wave*8,184-wave*66]];}
    if(p.id==='march'){knees[0][1]-=wave*40;feet[0][1]-=wave*42;knees[1][1]-=(1-wave)*40;feet[1][1]-=(1-wave)*42;}
    if(p.id==='side'){feet[0][0]-=wave*32;knees[0][0]-=wave*20;feet[1][0]+=(1-wave)*32;knees[1][0]+=(1-wave)*20;}
    if(p.id==='heel'){y=-wave*15;hip=hip.map(([x,v])=>[x,v+y]);knees=knees.map(([x,v])=>[x,v+y]);feet=feet.map(([x,v])=>[x,v+y]);}
    head[1]+=y; shoulders=shoulders.map(([x,v])=>[x,v+y]);elbows=elbows.map(([x,v])=>[x,v+y]);hands=hands.map(([x,v])=>[x,v+y]);
    const path=(pts,color,width)=>`<polyline points="${pts.map(p=>p.join(',')).join(' ')}" stroke="${color}" stroke-width="${width}"/>`;
    $('#figureLimbs').innerHTML=path([shoulders[0],elbows[0],hands[0]],'#b9c3c6',16)+path([shoulders[1],elbows[1],hands[1]],'#b9c3c6',16)+path([hip[0],knees[0],feet[0]],'#c1ff34',20)+path([hip[1],knees[1],feet[1]],'#8ebe30',20)+path([[180,105+y],[180,182+y]],'url(#bodyGradient)',45)+`<circle cx="${head[0]}" cy="${head[1]}" r="22" fill="#dde4e5" stroke="none"/>`+path([[140,282],[163,282]],'#dde4e5',10)+path([[199,282],[222,282]],'#dde4e5',10);
    $('#figureWeights').innerHTML=p.weights&&p.id!=='rest'?hands.map(([x,y])=>`<g transform="translate(${x} ${y})"><rect x="-17" y="-3" width="34" height="6" rx="2"/><rect x="-20" y="-10" width="9" height="20" rx="2"/><rect x="11" y="-10" width="9" height="20" rx="2"/></g>`).join(''):'';
  }
  document.querySelectorAll('[data-workout]').forEach(b=>b.addEventListener('click',()=>select(b.dataset.workout)));
  document.querySelectorAll('[data-workout-filter]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-workout-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));document.querySelectorAll('[data-workout-category]').forEach(c=>c.hidden=b.dataset.workoutFilter!=='all'&&c.dataset.workoutCategory!==b.dataset.workoutFilter);}));
  $('#workoutStart').addEventListener('click',()=>{if(active){pause();return;}if(finished){select(Object.keys(routines).find(k=>routines[k]===routine));}active=true;last=Date.now();timer=setInterval(()=>{advance();draw();},200);draw();});
  $('#workoutNext').addEventListener('click',()=>{if(active)advance();if(finished)return;if(index===phases.length-1){complete();}else{index++;elapsed=0;last=Date.now();}draw();});
  $('#workoutReset').addEventListener('click',()=>select(Object.keys(routines).find(k=>routines[k]===routine)));
  $('#motionToggle').addEventListener('click',()=>{motion=!motion;draw();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&active)pause();});window.addEventListener('pagehide',pause);
  setInterval(()=>{if(routine&&!document.hidden)figure();},60);
})();
