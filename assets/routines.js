(() => {
  'use strict';
  const $ = s => document.querySelector(s), dialog = $('#workoutDialog');
  if (!dialog) return;
  const ex = {
    march:{name:'Marcha en el sitio',cue:'Alterna las rodillas con pasos suaves. Mantén el torso erguido y acompaña con los brazos.',alt:'Menor intensidad: levanta menos las rodillas.',view:'Vista frontal',tempo:2.4},
    side:{name:'Pasos laterales',cue:'Da un paso lateral y acerca el otro pie sin cruzarlo. Mantén las rodillas suaves.',alt:'Menor intensidad: acorta los pasos.',view:'Vista frontal',tempo:3},
    shoulders:{name:'Movilidad de hombros',cue:'Eleva los brazos de forma suave hasta un rango cómodo y vuelve despacio. Evita encoger los hombros.',alt:'Reduce la altura si lo necesitas; no fuerces el recorrido.',view:'Vista frontal',tempo:5},
    heel:{name:'Elevación de talones',cue:'Sube ambos talones y baja lentamente. Conserva los pies paralelos y el equilibrio.',alt:'Puedes apoyar una mano en una superficie estable.',view:'Vista lateral',tempo:4},
    squat:{name:'Sentadilla',cue:'Lleva la cadera atrás y flexiona las rodillas. Mantén los talones apoyados y vuelve con control.',alt:'Reduce la profundidad o practica sin carga frente a una silla estable.',view:'Vista lateral',tempo:4},
    wall:{name:'Flexión en pared',cue:'Apoya las manos a la altura del pecho. Acerca el torso flexionando los codos y empuja sin arquear la espalda.',alt:'Acerca los pies a la pared para reducir la dificultad.',view:'Vista lateral',tempo:4},
    bridge:{name:'Puente de glúteos',cue:'Boca arriba, rodillas flexionadas y pies apoyados. Eleva la pelvis sin arquear la zona lumbar y baja despacio.',alt:'Reduce la elevación y mantén la cabeza apoyada.',view:'Vista lateral',tempo:4},
    jack:{name:'Apertura lateral sin salto',cue:'Abre un pie hacia un lado mientras elevas los brazos. Regresa y alterna el lado, sin saltar.',alt:'Deja los brazos por debajo de los hombros si lo prefieres.',view:'Vista frontal',tempo:3},
    row:{name:'Remo con mancuernas',cue:'Flexiona ligeramente las rodillas e inclina el torso desde la cadera, con la espalda estable. Lleva los codos hacia atrás y baja sin balancearte.',alt:'Usa menos carga y un rango cómodo. Pide ayuda al entrenador para ajustar la postura.',view:'Vista lateral',tempo:4},
    press:{name:'Press con mancuernas en suelo',cue:'Boca arriba, pies apoyados. Empuja las mancuernas sobre el pecho sin bloquear los codos. Baja hasta apoyar suavemente los brazos en el suelo.',alt:'Comienza con mancuernas ligeras; colócalas y retíralas con ayuda si lo necesitas.',view:'Vista lateral',tempo:4}
  };
  const routines = {
    movilidad:{name:'Activa tu cuerpo',goal:'Movilidad y activación',level:'Suave',equipment:'Sin equipo',list:['shoulders','side','heel'],rounds:1,work:50,rest:15,warm:60,cool:60,dose:'Recorrido cómodo, sin forzar'},
    fuerza:{name:'Fuerza esencial',goal:'Piernas · pecho · glúteos',level:'Inicial',equipment:'Pared y esterilla',list:['squat','wall','bridge'],rounds:2,work:40,rest:30,warm:120,cool:90,dose:'8–10 repeticiones controladas'},
    cardio:{name:'Cardio sin saltos',goal:'Actividad continua de bajo impacto',level:'Inicial',equipment:'Sin equipo',list:['march','side','jack'],rounds:3,work:50,rest:30,warm:120,cool:90,dose:'Ritmo cómodo; puedes hablar'},
    gym:{name:'Pesas / Gym',goal:'Piernas · espalda · pecho',level:'Base de fuerza',equipment:'Mancuernas y esterilla',list:['squat','row','press'],rounds:2,work:40,rest:60,warm:180,cool:180,weights:true,dose:'8–10 repeticiones · carga ligera'}
  };
  let selectedId, routine, phases=[], index=0, elapsed=0, spent=0, active=false, finished=false, last=0, timer=null, started=false, skipped=false, opener;
  let animationTime=0, frameLast=Date.now(), motion=!(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  const fmt = s => {s=Math.max(0,Math.ceil(s));return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;};
  function pause(){if(active)advance();active=false;clearInterval(timer);timer=null;draw();}
  function build(){
    phases=[];
    const warm=['march','shoulders','side'];
    warm.forEach(id=>phases.push({id,stage:'Calentamiento',seconds:routine.warm/3,dose:'Sin pesas · ritmo suave'}));
    const count=routine.rounds*routine.list.length;let n=0;
    for(let round=1;round<=routine.rounds;round++)for(const id of routine.list){
      phases.push({id,stage:'Entrenamiento',seconds:routine.work,round,weights:!!routine.weights,dose:routine.dose});
      if(++n<count)phases.push({id:'rest',stage:'Descanso',seconds:routine.rest,dose:'Respira y prepara el siguiente ejercicio'});
    }
    ['march','shoulders'].forEach(id=>phases.push({id,stage:'Vuelta a la calma',seconds:routine.cool/2,dose:'Sin pesas · baja el ritmo'}));
  }
  function select(id,reset=false){
    pause();
    if(selectedId!==id||reset){selectedId=id;routine=routines[id];build();index=0;elapsed=0;spent=0;finished=false;started=false;skipped=false;animationTime=0;$('#workoutStatus').textContent='';}
    $('#workoutDialogTitle').textContent=routine.name;$('#workoutLabel').textContent=routine.goal;
    $('#workoutFacts').replaceChildren(...[routine.level,routine.equipment,`${Math.round(phases.reduce((n,p)=>n+p.seconds,0)/60)} min aprox.`,`${routine.rounds} ${routine.rounds===1?'vuelta':'vueltas'}`].map(text=>{const span=document.createElement('span');span.textContent=text;return span;}));
    $('#workoutPlan').replaceChildren(...phases.map(p=>{const li=document.createElement('li');const name=p.id==='rest'?'Descanso':ex[p.id].name;li.textContent=`${p.stage} / ${name}${p.round?' · vuelta '+p.round:''} · ${fmt(p.seconds)}`;return li;}));
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
    $('#workoutNext').textContent=p.stage==='Entrenamiento'&&['fuerza','gym'].includes(selectedId)?'Terminé la serie':'Siguiente';
    $('#workoutStep').textContent=`Bloque ${index+1} de ${phases.length}${p.round?' · Vuelta '+p.round+' de '+routine.rounds:''}`;
    const percent=finished?100:Math.round((phases.slice(0,index).reduce((n,p)=>n+p.seconds,0)+elapsed)/phases.reduce((n,p)=>n+p.seconds,0)*100);
    $('#workoutProgress').style.width=percent+'%';$('#workoutProgress').parentElement.setAttribute('aria-valuenow',percent);
    [...$('#workoutPlan').children].forEach((li,i)=>{const step=phases[i];li.textContent=`${step.stage} / ${step.id==='rest'?'Descanso':ex[step.id].name}${step.round?' · vuelta '+step.round:''} · ${fmt(step.seconds)}`;li.classList.toggle('current',i===index);if(i===index)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');});
    $('#motionToggle').setAttribute('aria-pressed',String(motion));$('#motionToggle').textContent=motion?'Animación: activa':'Animación: estática';
    $('#figureTitle').textContent=p.id==='rest'?'Figura en descanso':`Demostración esquemática: ${e.name}`;
    $('#movementLabel').textContent=p.id==='rest'?'Recuperación':`${e.view} · ciclo ilustrativo ${e.tempo} s`;
    figure();
  }
  const add=(p,x,y)=>[p[0]+x,p[1]+y];
  // Two rigid segments joined at a joint, rather than stretching the limbs.
  function joint(a,b,l1,l2,side=1){const dx=b[0]-a[0],dy=b[1]-a[1],raw=Math.hypot(dx,dy)||1,d=Math.min(l1+l2-.1,Math.max(Math.abs(l1-l2)+.1,raw));const ux=dx/raw,uy=dy/raw,k=(l1*l1-l2*l2+d*d)/(2*d),h=Math.sqrt(Math.max(0,l1*l1-k*k));return[a[0]+ux*k-uy*h*side,a[1]+uy*k+ux*h*side];}
  function figure(){
    if(!routine)return;const p=phases[index], id=finished?'rest':p.id, e=ex[id];const t=motion?animationTime/(e?.tempo||4)*Math.PI*2:0;const q=(1-Math.cos(t))/2, alt=(1+Math.cos(t))/2;
    let head=[180,59],s1=[161,99],s2=[199,99],h1=[165,181],h2=[195,181],hand1=[145,181],hand2=[215,181],foot1=[150,280],foot2=[210,280],elbowSides=[1,-1],kneeSides=[1,-1],sideView=false,scene='',floor=false;
    if(['squat','heel','row','wall'].includes(id)){
      sideView=true;s1=[180,100];s2=[174,103];h1=[178,183];h2=[172,185];head=[184,59];hand1=[181,183];hand2=[175,186];foot1=[190,280];foot2=[178,280];kneeSides=[-1,-1];elbowSides=[1,1];
      if(id==='squat'){h1=[178-q*30,183+q*35];h2=add(h1,-6,2);s1=[180-q*8,100+q*40];s2=add(s1,-6,3);head=add(s1,4,-40);hand1=p.weights?add(s1,0,83):[235,143+q*30];hand2=add(hand1,-6,3);}
      if(id==='heel'){const lift=-q*15;head=add(head,0,lift);s1=add(s1,0,lift);s2=add(s2,0,lift);h1=add(h1,0,lift);h2=add(h2,0,lift);hand1=add(hand1,0,lift);hand2=add(hand2,0,lift);foot1=add(foot1,0,lift);foot2=add(foot2,0,lift);}
      if(id==='row'){h1=[156,196];h2=add(h1,-6,2);s1=[220,145];s2=add(s1,-6,3);head=[249,119];hand1=[225-q*35,227-q*50];hand2=add(hand1,-6,3);elbowSides=[-1,-1];}
      if(id==='wall'){scene='<path d="M272 65V291" stroke="#71806b" stroke-width="8"/>';s1=[198+q*24,112];s2=add(s1,-6,3);h1=[173+q*15,196];h2=add(h1,-6,2);head=add(s1,8,-41);foot1=[155,280];foot2=[143,280];hand1=[267,133];hand2=[267,140];elbowSides=[1,1];}
    }
    if(id==='march'){foot1=[150,280-q*37];foot2=[210,280-alt*37];hand1=[135+q*15,169-q*15];hand2=[225-alt*15,169-alt*15];}
    if(id==='side'||id==='jack'){const sway=Math.sin(t)*15;head=add(head,sway,0);s1=add(s1,sway,0);s2=add(s2,sway,0);h1=add(h1,sway,0);h2=add(h2,sway,0);foot1=[150-q*35,280];foot2=[210-alt*35,280];hand1=add(hand1,sway,0);hand2=add(hand2,sway,0);}
    if(id==='shoulders'||id==='jack'){const a=id==='jack'?q:q*.8;hand1=[145-a*40,181-a*103];hand2=[215+a*40,181-a*103];}
    if(id==='bridge'||id==='press'){
      floor=true;sideView=true;scene='<rect x="42" y="281" width="276" height="8" rx="4" fill="#65744c"/>';head=[76,257];s1=[106,263];s2=[106,257];h1=[191,263-(id==='bridge'?q*40:0)];h2=add(h1,0,-6);foot1=[267,276];foot2=[261,271];kneeSides=[-1,-1];hand1=id==='press'?[115,216-q*35]:[181,273];hand2=add(hand1,0,-7);elbowSides=[-1,-1];
    }
    const poly=(pts,color,width)=>`<polyline points="${pts.map(v=>v.join(',')).join(' ')}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
    const limb=(a,b,l1,l2,sign,color,width)=>{const j=joint(a,b,l1,l2,sign);return poly([a,j,b],color,width)+`<circle cx="${j[0]}" cy="${j[1]}" r="${width*.33}" fill="#172020" stroke="${color}" stroke-width="2"/>`;};
    const leg1=limb(h1,foot1,53,50,kneeSides[0],'#b1db4a',19),leg2=limb(h2,foot2,53,50,kneeSides[1],'#678c37',18);
    const arm1=limb(s1,hand1,43,43,elbowSides[0],'#d3dcdf',13),arm2=limb(s2,hand2,43,43,elbowSides[1],'#7b8e93',12);
    const shoulderMid=[(s1[0]+s2[0])/2,(s1[1]+s2[1])/2],hipMid=[(h1[0]+h2[0])/2,(h1[1]+h2[1])/2];
    const torso=poly([shoulderMid,hipMid],'url(#bodyGradient)',sideView?31:42)+poly([shoulderMid,hipMid],'#ddff7940',3);
    const shoe=(v)=>`<path d="M${v[0]-8} ${v[1]+3}${id==='heel'?`L${v[0]+15} 283`:'h23'}" stroke="#edf0e7" stroke-width="9" stroke-linecap="round"/>`;
    $('#figureLimbs').innerHTML=scene+leg2+arm2+torso+leg1+arm1+`<circle cx="${head[0]}" cy="${head[1]}" r="20" fill="#d8e1e3"/><path d="M${head[0]-12} ${head[1]-3}h23" stroke="#657579" stroke-width="4" stroke-linecap="round"/>`+shoe(foot1)+shoe(foot2);
    $('#figureWeights').innerHTML=p.weights&&id!=='rest'? [hand2,hand1].map(([x,y])=>`<g transform="translate(${x} ${y})"><rect x="-15" y="-3" width="30" height="6" rx="2" fill="#9daaac"/><rect x="-20" y="-11" width="10" height="22" rx="3" fill="#dbe3e5"/><rect x="10" y="-11" width="10" height="22" rx="3" fill="#dbe3e5"/></g>`).join(''):'';
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
  setInterval(()=>{const now=Date.now(),delta=Math.min(100,Math.max(0,now-frameLast));frameLast=now;if(!routine||!dialog.open||document.hidden)return;if(motion&&(!started||active))animationTime+=delta/1000;figure();},40);
})();
