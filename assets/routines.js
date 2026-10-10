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
  const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
  const center=(a,b)=>mix(a,b,.5);
  const point=(p,a,l)=>[p[0]+Math.sin(a)*l,p[1]+Math.cos(a)*l];
  function joint(a,b,l1,l2,side=1){const dx=b[0]-a[0],dy=b[1]-a[1],raw=Math.hypot(dx,dy)||1,d=Math.min(l1+l2-.05,Math.max(Math.abs(l1-l2)+.05,raw)),ux=dx/raw,uy=dy/raw,k=(l1*l1-l2*l2+d*d)/(2*d),h=Math.sqrt(Math.max(0,l1*l1-k*k));return[a[0]+ux*k-uy*h*side,a[1]+uy*k+ux*h*side];}
  let lastFigureId;
  function figure(){
    if(!routine)return;
    const p=phases[index],id=finished?'rest':p.id,e=ex[id],cycle=motion?animationTime/(e?.tempo||4):.18;
    const phase=((cycle%1)+1)%1,t=cycle*Math.PI*2;
    const ease=u=>(1-Math.cos(Math.PI*Math.max(0,Math.min(1,u))))/2;
    // Controlled lowering, a short turnaround, then a steady return.
    const q=phase<.55?ease(phase/.55):phase<.61?1:phase<.96?1-ease((phase-.61)/.35):0;
    const breathe=Math.sin(animationTime*1.8)*.5;
    let s1=[159,102],s2=[199,102],h1=[165,183],h2=[195,183],hand1=[144,179],hand2=[216,179],foot1=[153,280],foot2=[207,280],head=[179,62],armSigns=[1,-1],legSigns=[1,-1],profile=false,floor=false,scene='',phrase='Respira con normalidad',rowElbow1=null,rowElbow2=null;
    const rising=phase<.61;
    if(['squat','heel','row','wall'].includes(id)){
      profile=true;h1=[175,181];h2=[166,183];s1=[177,100];s2=[168,102];head=[180,62];hand1=[180,179];hand2=[171,181];foot1=[186,280];foot2=[174,280];armSigns=[1,1];legSigns=[-1,-1];
      if(id==='squat'){
        const hip=[175-30*q,181+36*q],lean=.04+.30*q;
        h1=hip;h2=add(hip,-9,2);s1=add(hip,Math.sin(lean)*81,-Math.cos(lean)*81);s2=add(s1,-9,2);head=add(s1,Math.sin(lean)*35+2,-Math.cos(lean)*35-3);
        hand1=p.weights?add(s1,4,78):add(s1,61,24+q*8);hand2=add(hand1,-9,2);
        phrase=rising?'Lleva la cadera atrás':'Vuelve con control';
      }
      if(id==='heel'){
        const lift=-q*15;h1=add(h1,0,lift);h2=add(h2,0,lift);s1=add(s1,0,lift);s2=add(s2,0,lift);head=add(head,0,lift);hand1=add(hand1,0,lift);hand2=add(hand2,0,lift);foot1=add(foot1,0,lift);foot2=add(foot2,0,lift);
        phrase=rising?'Eleva los talones':'Baja lentamente';
      }
      if(id==='row'){
        h1=[155,196];h2=add(h1,-9,2);s1=[215,138];s2=add(s1,-9,2);head=[242,112];
        foot1=[186,285.5];foot2=[174,285.5];
        rowElbow1=point(s1,-1.12*q,40);rowElbow2=point(s2,-1.12*q,40);
        hand1=point(rowElbow1,.08*q,40);hand2=point(rowElbow2,.08*q,40);
        phrase=rising?'Lleva los codos atrás':'Baja las mancuernas';
      }
      if(id==='wall'){
        scene='<path d="M274 74V288" stroke="#6e7f75" stroke-width="7"/><path d="M278 74V288" stroke="#ffffff15" stroke-width="2"/>';
        const tilt=.20+.18*q;s1=[155+Math.sin(tilt)*179,280-Math.cos(tilt)*179];s2=add(s1,-9,3);h1=[155+Math.sin(tilt)*98,280-Math.cos(tilt)*98];h2=add(h1,-9,3);head=add(s1,Math.sin(tilt)*33,-Math.cos(tilt)*33-4);hand1=[268,134];hand2=[268,141];foot1=[155,280];foot2=[143,280];
        phrase=rising?'Acerca el pecho a la pared':'Empuja con control';
      }
    }
    if(id==='march'){
      const l=Math.pow(Math.max(0,Math.sin(t)),2),r=Math.pow(Math.max(0,-Math.sin(t)),2),sway=Math.sin(t)*4,bob=-Math.pow(Math.sin(t),2)*2;
      h1=add(h1,sway,bob);h2=add(h2,sway,bob);s1=add(s1,sway*.65,bob);s2=add(s2,sway*.65,bob);head=add(head,sway*.45,bob);
      foot1=[153-9*l,280-40*l];foot2=[207+9*r,280-40*r];
      hand1=[145+10*r,178-21*r];hand2=[215-10*l,178-21*l];
      phrase=Math.sin(t)>=0?'Rodilla izquierda · brazo contrario':'Rodilla derecha · brazo contrario';
    }
    if(id==='side'||id==='jack'){
      const phase=((cycle%2)+2)%2,left=phase<1,u=phase%1,step=(1-Math.cos(u*Math.PI*2))/2,shift=(left?-1:1)*step*13,lift=Math.pow(Math.max(0,Math.sin(u*Math.PI*2)),2)*7;
      s1=add(s1,shift,step*2);s2=add(s2,shift,step*2);h1=add(h1,shift,step*2);h2=add(h2,shift,step*2);head=add(head,shift*.9,step*2);
      if(left)foot1=[153-step*42,280-lift];else foot2=[207+step*42,280-lift];
      hand1=add(hand1,shift,step*3);hand2=add(hand2,shift,step*3);
      if(id==='jack'){
        const angle=step*1.6;hand1=point(s1,-.15-angle,77);hand2=point(s2,.15+angle,77);
      }
      phrase=left?'Abre a la izquierda y regresa':'Abre a la derecha y regresa';
    }
    if(id==='shoulders'){
      const a=.14+q*1.95;hand1=point(s1,-a,77);hand2=point(s2,a,77);
      phrase=rising?'Eleva hasta un rango cómodo':'Regresa suavemente';
    }
    if(id==='bridge'||id==='press'){
      profile=true;floor=true;scene='<rect x="45" y="279" width="267" height="9" rx="4" fill="#41553e"/><path d="M53 282H306" stroke="#83a563" stroke-width="1"/>';
      head=[75,257];s1=[105,261];s2=[105,253];h1=[184,260-(id==='bridge'?q*38:0)];h2=add(h1,0,-8);foot1=[260,275];foot2=[255,269];legSigns=[-1,-1];armSigns=[-1,-1];
      hand1=id==='press'?[112+q*2,219-q*35]:[180,272];hand2=add(hand1,0,-8);
      phrase=id==='bridge'?(rising?'Eleva la pelvis, sin arquear':'Baja con control'):(rising?'Empuja sobre el pecho':'Baja hasta el suelo');
    }
    if(id==='rest'){s1=add(s1,0,breathe);s2=add(s2,0,breathe);head=add(head,0,breathe);phrase=finished?'Buen trabajo':'Recupera el ritmo';}
    const n=v=>Math.round(v*100)/100,coords=p=>p.map(n).join(' ');
    const line=(a,b,color,width)=>`<path d="M${coords(a)}L${coords(b)}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
    const silhouette='#f4f6ee',depth='#a8b9ad';
    const limb=(a,b,l1,l2,sign,color,width)=>{
      const j=joint(a,b,l1,l2,sign);
      return `<path d="M${coords(a)}L${coords(j)}L${coords(b)}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
    };
    const arm=(a,b,sign,far)=>{
      if(id==='row'){
        const elbow=far?rowElbow2:rowElbow1;
        return `<path class="row-arm ${far?'far':'near'}" d="M${coords(a)}L${coords(elbow)}L${coords(b)}" fill="none" stroke="${far?depth:silhouette}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>`;
      }
      return limb(a,b,40,40,sign,far?depth:silhouette,15);
    };
    const leg=(a,b,sign,far)=>limb(a,b,51,49,sign,far?depth:silhouette,22);
    const sm=center(s1,s2),hm=center(h1,h2),dx=hm[0]-sm[0],dy=hm[1]-sm[1],len=Math.hypot(dx,dy)||1,normal=[dy/len,-dx/len];
    const edge=(v,w)=>add(v,normal[0]*w,normal[1]*w),width=profile?15:23,waist=profile?13:17,sl=edge(sm,width),sr=edge(sm,-width),hl=edge(hm,waist),hr=edge(hm,-waist),ml=edge(mix(sm,hm,.5),width*.8),mr=edge(mix(sm,hm,.5),-width*.8);
    const torso=`<path d="M${coords(sl)}Q${coords(add(sm,normal[1]*9,-normal[0]*9))} ${coords(sr)}Q${coords(mr)} ${coords(hr)}Q${coords(hm)} ${coords(hl)}Q${coords(ml)} ${coords(sl)}Z" fill="${silhouette}"/>`;
    const shoe=(v,far)=>line(add(v,-5,2),[v[0]+13,id==='heel'?282:v[1]+2],far?depth:silhouette,9);
    const markers={squat:[300,166,300,214],heel:[249,248,249,218],row:[271,211,238,190],wall:[232,75,253,75],bridge:[193,220,193,185],press:[139,208,139,175],shoulders:[290,168,290,118],march:[112,235,112,204],side:[92,246,64,246],jack:[285,192,285,151]};
    const m=markers[id];const arrow=m?(rising||['march','side','jack'].includes(id)?m:[m[2],m[3],m[0],m[1]]):null;
    const guide=arrow?`<path d="M${arrow[0]} ${arrow[1]}L${arrow[2]} ${arrow[3]}" fill="none" stroke="#c1ff34" stroke-opacity=".7" stroke-width="1.5" marker-end="url(#motionArrow)"/>`:'';
    $('#figureLimbs').innerHTML=scene+guide+leg(h2,foot2,legSigns[1],true)+arm(s2,hand2,armSigns[1],true)+torso+leg(h1,foot1,legSigns[0],false)+arm(s1,hand1,armSigns[0],false)+`<circle cx="${n(head[0])}" cy="${n(head[1])}" r="19" fill="${silhouette}"/>`+shoe(foot2,true)+shoe(foot1,false);
    $('#figureWeights').innerHTML=p.weights&&id!=='rest'?[hand2,hand1].map(([x,y])=>`<g transform="translate(${n(x)} ${n(y)})"><rect x="-14" y="-3" width="28" height="6" rx="2" fill="#c1ff34"/><rect x="-20" y="-10" width="10" height="20" rx="3" fill="#c1ff34"/><rect x="10" y="-10" width="10" height="20" rx="3" fill="#c1ff34"/></g>`).join(''):'';
    $('#movementLabel').textContent=`${e?.view||'Recuperación'} · ${phrase}`;
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
