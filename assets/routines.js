(() => {
  'use strict';
  const $ = s => document.querySelector(s), dialog = $('#workoutDialog');
  if (!dialog) return;
  const ex = {
    march:{name:'Trote suave en el sitio',cue:'Alterna pasos cortos y ligeros. Flexiona los codos y mueve cada brazo con la pierna contraria.',alt:'Menor intensidad: marcha sin saltar y levanta menos las rodillas.',view:'Vista lateral',tempo:1.2},
    side:{name:'Pasos laterales',cue:'Da un paso lateral y acerca el otro pie sin cruzarlo. Mantén las rodillas suaves.',alt:'Menor intensidad: acorta los pasos.',view:'Vista frontal',tempo:3},
    shoulders:{name:'Movilidad de hombros',cue:'Eleva los brazos de forma suave hasta un rango cómodo y vuelve despacio. Evita encoger los hombros.',alt:'Reduce la altura si lo necesitas; no fuerces el recorrido.',view:'Vista frontal',tempo:5},
    heel:{name:'Elevación de talones',cue:'Sube ambos talones y baja lentamente. Conserva los pies paralelos y el equilibrio.',alt:'Puedes apoyar una mano en una superficie estable.',view:'Vista lateral',tempo:4},
    squat:{name:'Sentadilla',cue:'Lleva la cadera atrás y flexiona las rodillas. Mantén los talones apoyados y vuelve con control.',alt:'Reduce la profundidad o practica sin carga frente a una silla estable.',view:'Vista lateral',tempo:4},
    wall:{name:'Flexión en pared',cue:'Apoya las manos a la altura del pecho. Acerca el torso flexionando los codos y empuja sin arquear la espalda.',alt:'Acerca los pies a la pared para reducir la dificultad.',view:'Vista lateral',tempo:4},
    bridge:{name:'Puente de glúteos',cue:'Boca arriba, rodillas flexionadas y pies apoyados. Eleva la pelvis sin arquear la zona lumbar y baja despacio.',alt:'Reduce la elevación y mantén la cabeza apoyada.',view:'Vista lateral',tempo:4},
    jack:{name:'Apertura lateral sin salto',cue:'Abre un pie hacia un lado mientras elevas los brazos. Regresa y alterna el lado, sin saltar.',alt:'Deja los brazos por debajo de los hombros si lo prefieres.',view:'Vista frontal',tempo:3},
    row:{name:'Remo con mancuernas',cue:'Flexiona ligeramente las rodillas e inclina el torso desde la cadera, con la espalda estable. Lleva los codos hacia atrás y baja sin balancearte.',alt:'Usa menos carga y un rango cómodo. Pide ayuda al entrenador para ajustar la postura.',view:'Vista lateral',tempo:4},
    curl:{name:'Curl de bíceps',cue:'Codos junto al torso. Flexiona los brazos y baja las mancuernas despacio, sin balancear el cuerpo.',alt:'Reduce la carga si necesitas mover los hombros o el torso.',view:'Vista frontal',tempo:4},
    overhead:{name:'Press de hombros',cue:'Mancuernas a la altura de hombros. Empuja hacia arriba sin arquear la espalda y baja con control.',alt:'Usa una carga ligera y un recorrido cómodo. Evita bloquear los codos.',view:'Vista frontal',tempo:4},
    lateral:{name:'Elevaciones laterales',cue:'Con una ligera flexión de codos, eleva los brazos hacia los lados hasta la altura de hombros. Baja lentamente.',alt:'Usa menos peso y evita encoger los hombros.',view:'Vista frontal',tempo:3.5},
    hinge:{name:'Peso muerto rumano',cue:'Rodillas ligeramente flexionadas. Lleva la cadera atrás, mantén la espalda estable y baja las pesas cerca de las piernas. Vuelve extendiendo la cadera.',alt:'Practica primero sin carga y limita la bajada al rango que puedas controlar.',view:'Vista lateral',tempo:4},
    press:{name:'Press con mancuernas en suelo',cue:'Boca arriba, pies apoyados. Empuja las mancuernas sobre el pecho sin bloquear los codos. Baja hasta apoyar suavemente los brazos en el suelo.',alt:'Comienza con mancuernas ligeras; colócalas y retíralas con ayuda si lo necesitas.',view:'Vista lateral',tempo:4}
  };
  const routines = {
    movilidad:{name:'Activa tu cuerpo',goal:'Movilidad y activación',level:'Suave',equipment:'Sin equipo',list:['shoulders','side','heel'],rounds:1,work:50,rest:15,warm:60,cool:60,dose:'Recorrido cómodo, sin forzar'},
    fuerza:{name:'Fuerza esencial',goal:'Piernas · pecho · glúteos',level:'Inicial',equipment:'Pared y esterilla',list:['squat','wall','bridge'],rounds:2,work:40,rest:30,warm:120,cool:90,dose:'8–10 repeticiones controladas'},
    cardio:{name:'Cardio sin saltos',goal:'Actividad continua de bajo impacto',level:'Inicial',equipment:'Sin equipo',list:['march','side','jack'],rounds:3,work:50,rest:30,warm:120,cool:90,dose:'Ritmo cómodo; puedes hablar'},
    gym:{name:'Gym / Cuerpo completo',goal:'Piernas · espalda · pecho',level:'Base de fuerza',equipment:'Mancuernas y esterilla',list:['squat','row','press'],rounds:2,work:40,rest:60,warm:180,cool:180,weights:true,dose:'8–10 repeticiones · carga controlable',warmList:['march','shoulders','hinge']},
    piernas:{name:'Gym / Piernas y glúteos',goal:'Cuádriceps · glúteos · isquiotibiales · pantorrillas',level:'Base de fuerza',equipment:'Mancuernas',list:['squat','hinge','heel'],rounds:2,work:40,rest:60,warm:180,cool:180,weights:true,dose:'8–10 repeticiones · carga controlable',warmList:['march','hinge','squat']},
    tiron:{name:'Gym / Espalda y bíceps',goal:'Espalda · bíceps',level:'Base de fuerza',equipment:'Mancuernas',list:['row','curl'],rounds:3,work:40,rest:60,warm:180,cool:180,weights:true,dose:'8–10 repeticiones · carga controlable',warmList:['march','shoulders','row']},
    empuje:{name:'Gym / Pecho y hombros',goal:'Pecho · hombros · tríceps',level:'Base de fuerza',equipment:'Mancuernas y esterilla',list:['press','overhead','lateral'],rounds:2,work:40,rest:60,warm:180,cool:180,weights:true,dose:'8–10 repeticiones · carga controlable',warmList:['march','shoulders','wall']}
  };
  let selectedId, routine, phases=[], index=0, elapsed=0, spent=0, active=false, finished=false, last=0, timer=null, started=false, skipped=false, opener;
  let animationTime=0, frameLast=Date.now(), motion=!(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  const fmt = s => {s=Math.max(0,Math.ceil(s));return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;};
  function pause(){if(active)advance();active=false;clearInterval(timer);timer=null;draw();}
  function build(){
    phases=[];
    const warm=routine.warmList||['march','shoulders','side'];
    warm.forEach(id=>phases.push({id,stage:'Calentamiento',seconds:routine.warm/3,dose:'Sin pesas · practica el movimiento con suavidad'}));
    const work=[];
    if(routine.weights){for(const id of routine.list)for(let round=1;round<=routine.rounds;round++)work.push({id,round});}
    else{for(let round=1;round<=routine.rounds;round++)for(const id of routine.list)work.push({id,round});}
    work.forEach(({id,round},i)=>{
      const override=routine.weights&&id==='heel'?{seconds:60,dose:'12–15 repeticiones · sin rebotes'}:routine.weights&&id==='lateral'?{seconds:50,dose:'10–12 repeticiones · carga ligera'}:{seconds:routine.work,dose:routine.dose};
      phases.push({id,stage:'Entrenamiento',...override,round,weights:!!routine.weights});
      if(i<work.length-1)phases.push({id:'rest',stage:'Descanso',seconds:routine.rest,dose:work[i+1].id===id?'Descansa antes de repetir la serie':'Descansa y prepara el siguiente ejercicio'});
    });
    ['march','shoulders'].forEach(id=>phases.push({id,stage:'Vuelta a la calma',seconds:routine.cool/2,dose:'Sin pesas · baja el ritmo'}));
  }
  function select(id,reset=false){
    pause();
    if(selectedId!==id||reset){selectedId=id;routine=routines[id];build();index=0;elapsed=0;spent=0;finished=false;started=false;skipped=false;animationTime=0;$('#workoutStatus').textContent='';}
    $('#workoutDialogTitle').textContent=routine.name;$('#workoutLabel').textContent=routine.goal;
    $('#workoutFacts').replaceChildren(...[routine.level,routine.equipment,`${Math.ceil(phases.reduce((n,p)=>n+p.seconds,0)/60)} min aprox.`,`${routine.rounds} ${routine.weights?'series por ejercicio':routine.rounds===1?'vuelta':'vueltas'}`].map(text=>{const span=document.createElement('span');span.textContent=text;return span;}));
    $('#workoutPlan').replaceChildren(...phases.map(p=>{const li=document.createElement('li');const name=p.id==='rest'?'Descanso':ex[p.id].name;li.textContent=`${p.stage} / ${name}${p.round?(routine.weights?' · serie ':' · vuelta ')+p.round:''} · ${fmt(p.seconds)}`;return li;}));
    if(!dialog.open){dialog.showModal();document.body.classList.add('workout-modal-open');}
    draw();
  }
  function complete(){
    active=false;finished=true;clearInterval(timer);timer=null;
    const minutes=Math.round(spent/60*10)/10;
    $('#workoutStatus').textContent=minutes>0?'Sesión finalizada.':'Recorrido finalizado sin tiempo de actividad registrado.';
    if(minutes>0)document.dispatchEvent(new CustomEvent('vital-workout-complete',{detail:{label:routine.name+(skipped?' · sesión parcial':''),minutes}}));
  }
  function advance(){
    const now=Date.now();let delta=Math.max(0,(now-last)/1000);last=now;
    while(delta>0&&!finished){const amount=Math.min(delta,phases[index].seconds-elapsed);elapsed+=amount;spent+=amount;delta-=amount;
      if(elapsed>=phases[index].seconds){if(index===phases.length-1){complete();break;}index++;elapsed=0;animationTime=0;}}
  }
  function draw(){
    if(!routine)return;const p=phases[index], e=ex[p.id];
    $('#exerciseName').textContent=finished?'Sesión finalizada':p.id==='rest'?'Toma un descanso':e.name+(p.weights&&p.id==='squat'?' con mancuernas':'');
    $('#exerciseCue').textContent=finished?'Tu tiempo de actividad queda disponible en Mi espacio. Puedes repetir la sesión cuando quieras.':p.id==='rest'?'Relaja los brazos y respira con normalidad. Amplía el descanso si lo necesitas.':e.cue;
    $('#exerciseAlternative').textContent=finished?'':p.id==='rest'?`Después: ${ex[phases[index+1].id].name}.`:e.alt;
    $('#exerciseDose').textContent=finished?`${Math.round(spent/60*10)/10} min registrados`:p.dose;
    $('#workoutClock').textContent=finished?'00:00':fmt(p.seconds-elapsed);
    $('#workoutPhase').textContent=finished?'Finalizada':`${p.stage}${!active&&started?' · en pausa':''}`;
    $('#workoutStart').textContent=finished?'Repetir rutina ↗':active?'Pausar':started?'Continuar ↗':'Iniciar rutina ↗';
    $('#workoutNext').disabled=finished;$('#workoutExtra').disabled=finished;
    $('#workoutNext').textContent=p.stage==='Entrenamiento'&&(routine.weights||selectedId==='fuerza')?'Terminé la serie':'Siguiente';
    $('#workoutStep').textContent=`Bloque ${index+1} de ${phases.length}${p.round?(routine.weights?' · Serie ':' · Vuelta ')+p.round+' de '+routine.rounds:''}`;
    const percent=finished?100:Math.round((phases.slice(0,index).reduce((n,p)=>n+p.seconds,0)+elapsed)/phases.reduce((n,p)=>n+p.seconds,0)*100);
    $('#workoutProgress').style.width=percent+'%';$('#workoutProgress').parentElement.setAttribute('aria-valuenow',percent);
    [...$('#workoutPlan').children].forEach((li,i)=>{const step=phases[i];li.textContent=`${step.stage} / ${step.id==='rest'?'Descanso':ex[step.id].name}${step.round?(routine.weights?' · serie ':' · vuelta ')+step.round:''} · ${fmt(step.seconds)}`;li.classList.toggle('current',i===index);if(i===index)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');});
    $('#motionToggle').setAttribute('aria-pressed',String(motion));$('#motionToggle').textContent=motion?'Animación: activa':'Animación: estática';
    $('#figureTitle').textContent=p.id==='rest'?'Figura en descanso':`Demostración esquemática: ${e.name}`;
    $('#movementLabel').textContent=p.id==='rest'?'Recuperación':`${e.view} · ciclo ilustrativo ${e.tempo} s`;
    figure();
  }
  let lastFigureId;
  function figure(){
    if(!routine)return;const current=phases[index],id=finished?'rest':current.id,e=ex[id];
    const pose=window.VitalMotion.pose(id,motion?animationTime:(e?.tempo||4)*.18,!!current.weights);
    const n=v=>Math.round(v*100)/100,coords=p=>p.map(n).join(' '),center=(a,b)=>a.map((v,i)=>(v+b[i])/2),add=(p,x,y)=>[p[0]+x,p[1]+y];
    const line=(pts,color,width,classes='')=>`<path class="${classes}" d="M${pts.map(coords).join('L')}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
    const pale='#f4f6ee',depth='#a8b9ad';
    const arm=(i)=>line(pose.arms[i],i?depth:pale,15,`motion-arm ${i?'far':'near'}${id==='row'?' row-arm':''}`);
    const leg=(i)=>line(pose.legs[i],i?depth:pale,22,`motion-leg ${i?'far':'near'}`);
    const sm=center(...pose.shoulders),hm=center(...pose.hips),dx=hm[0]-sm[0],dy=hm[1]-sm[1],len=Math.hypot(dx,dy),normal=[dy/len,-dx/len],edge=(p,w)=>add(p,normal[0]*w,normal[1]*w),width=pose.profile?15:23,waist=pose.profile?13:17;
    const sl=edge(sm,width),sr=edge(sm,-width),hl=edge(hm,waist),hr=edge(hm,-waist);
    const torso=`<path class="motion-torso" d="M${coords(sl)}Q${coords(add(sm,normal[1]*9,-normal[0]*9))} ${coords(sr)}L${coords(hr)}Q${coords(hm)} ${coords(hl)}Z" fill="${pale}"/>`;
    const shoe=i=>{const v=pose.legs[i][2];return line([add(v,-5,2),[v[0]+13,id==='heel'?287.5:v[1]+2]],i?depth:pale,9);};
    const scene=pose.surface==='wall'?'<path d="M274 74V292" stroke="#6e7f75" stroke-width="7"/>':pose.surface==='mat'?'<rect x="45" y="287" width="267" height="6" rx="3" fill="#41553e"/>':'';
    const markers={squat:[300,166,300,214],heel:[249,248,249,218],row:[271,211,238,190],wall:[232,75,253,75],bridge:[193,220,193,185],press:[170,238,170,190],shoulders:[290,168,290,118],march:[112,235,112,204],side:[92,246,64,246],jack:[285,192,285,151],hinge:[280,149,280,202],curl:[270,184,270,138],overhead:[284,90,284,39],lateral:[284,177,300,127]};
    const m=markers[id],arrow=m?(pose.up||['march','side','jack'].includes(id)?m:[m[2],m[3],m[0],m[1]]):null;
    const guide=arrow?`<path d="M${arrow[0]} ${arrow[1]}L${arrow[2]} ${arrow[3]}" fill="none" stroke="#c1ff34" stroke-opacity=".7" stroke-width="1.5" marker-end="url(#motionArrow)"/>`:'';
    $('#figureLimbs').innerHTML=scene+guide+leg(1)+arm(1)+torso+leg(0)+arm(0)+`<circle cx="${n(pose.head[0])}" cy="${n(pose.head[1])}" r="19" fill="${pale}"/>`+shoe(1)+shoe(0);
    $('#figureWeights').innerHTML=pose.weights?[pose.arms[1][2],pose.arms[0][2]].map(([x,y])=>`<g transform="translate(${n(x)} ${n(y)})"><rect x="-14" y="-3" width="28" height="6" rx="2" fill="#c1ff34"/><rect x="-20" y="-10" width="10" height="20" rx="3" fill="#c1ff34"/><rect x="10" y="-10" width="10" height="20" rx="3" fill="#c1ff34"/></g>`).join(''):'';
    $('#movementLabel').textContent=`${e?.view||'Recuperación'} · ${pose.phrase}`;
    if(lastFigureId!==id){if(motion)$('#exerciseFigure').animate?.([{opacity:.35},{opacity:1}],{duration:280,easing:'ease-out'});lastFigureId=id;}
  }
  document.querySelectorAll('[data-workout]').forEach(b=>{b.setAttribute('aria-haspopup','dialog');b.addEventListener('click',()=>{opener=b;select(b.dataset.workout);});});
  document.querySelectorAll('[data-workout-filter]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-workout-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));document.querySelectorAll('[data-workout-category]').forEach(c=>c.hidden=b.dataset.workoutFilter!=='all'&&c.dataset.workoutCategory!==b.dataset.workoutFilter);}));
  $('#workoutStart').addEventListener('click',()=>{if(active){pause();return;}if(finished)select(selectedId,true);active=true;started=true;last=Date.now();timer=setInterval(()=>{advance();draw();},200);draw();});
  $('#workoutNext').addEventListener('click',()=>{if(active)advance();if(finished)return;skipped=true;if(index===phases.length-1)complete();else{index++;elapsed=0;animationTime=0;last=Date.now();}draw();});
  $('#workoutExtra').addEventListener('click',()=>{if(active)advance();if(finished)return;phases[index].seconds+=30;draw();});
  $('#workoutReset').addEventListener('click',()=>select(selectedId,true));
  $('#motionToggle').addEventListener('click',()=>{motion=!motion;draw();});
  $('#workoutClose').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('cancel',pause);dialog.addEventListener('close',()=>{pause();document.body.classList.remove('workout-modal-open');opener?.focus();});
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&active)pause();});window.addEventListener('pagehide',pause);
  function animateFrame(){
    const now=Date.now(),delta=Math.min(50,Math.max(0,now-frameLast));frameLast=now;
    if(routine&&dialog.open&&!document.hidden&&motion&&(!started||active)){
      animationTime+=delta/1000;
      figure();
    }
    window.requestAnimationFrame(animateFrame);
  }
  window.requestAnimationFrame(animateFrame);
})();
