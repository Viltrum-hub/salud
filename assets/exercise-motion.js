(() => {
  'use strict';
  const add=(p,x,y)=>[p[0]+x,p[1]+y],point=(p,a,l)=>[p[0]+Math.sin(a)*l,p[1]+Math.cos(a)*l];
  const ik=(a,b,l1,l2,sign)=>{const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy),k=(l1*l1-l2*l2+d*d)/(2*d),h=Math.sqrt(Math.max(0,l1*l1-k*k));return[a[0]+dx/d*k-dy/d*h*sign,a[1]+dy/d*k+dx/d*h*sign];};
  const arm=(s,upper,lower)=>{const elbow=point(s,upper,40);return[s,elbow,point(elbow,lower,40)];};
  function pose(id,time,weights=false){
    const tempo={march:1.2,side:3,jack:3,shoulders:5}[id]||4,cycle=time/tempo,phase=((cycle%1)+1)%1,t=cycle*Math.PI*2,ease=u=>(1-Math.cos(Math.PI*Math.max(0,Math.min(1,u))))/2;
    const q=phase<.55?ease(phase/.55):phase<.61?1:phase<.96?1-ease((phase-.61)/.35):0,up=phase<.61;
    let s1=[159,107],s2=[199,107],h1=[165,188],h2=[195,188],head=[179,67],f1=[153,285.5],f2=[207,285.5],a1=arm(s1,-.12,-.12),a2=arm(s2,.12,.12),signs=[1,-1],profile=false,surface='ground',phrase='Respira con normalidad';
    const stance=()=>{profile=true;h1=[175,188];h2=[166,190];s1=[177,107];s2=[168,109];head=[180,69];f1=[186,285.5];f2=[174,285.5];signs=[-1,-1];a1=arm(s1,0,0);a2=arm(s2,0,0);};
    if(['squat','heel','row','wall','hinge'].includes(id))stance();
    if(id==='row'){
      h1=[155,196];h2=[146,198];s1=[215,138];s2=[206,140];head=[242,112];a1=arm(s1,-1.12*q,.08*q);a2=arm(s2,-1.12*q,.08*q);phrase=up?'Lleva los codos atrás':'Baja las mancuernas';
    }
    if(id==='squat'||id==='hinge'){
      const lean=id==='hinge'?.04+.75*q:.04+.30*q;
      h1=id==='hinge'?[175-28*q,188+8*q]:[175-30*q,188+35*q];h2=add(h1,-9,2);s1=add(h1,Math.sin(lean)*81,-Math.cos(lean)*81);s2=add(s1,-9,2);head=add(s1,Math.sin(lean)*38,-Math.cos(lean)*38);
      a1=weights||id==='hinge'?arm(s1,0,0):arm(s1,.9+.4*q,1.35);a2=weights||id==='hinge'?arm(s2,0,0):arm(s2,.9+.4*q,1.35);
      phrase=up?'Lleva la cadera atrás':'Vuelve con control';
    }
    if(id==='heel'){
      const lift=-q*15;h1=add(h1,0,lift);h2=add(h2,0,lift);s1=add(s1,0,lift);s2=add(s2,0,lift);head=add(head,0,lift);f1=add(f1,0,lift);f2=add(f2,0,lift);a1=arm(s1,0,0);a2=arm(s2,0,0);phrase=up?'Eleva los talones':'Baja lentamente';
    }
    if(id==='wall'){
      surface='wall';const tilt=.225+.18*q;s1=[155+Math.sin(tilt)*179,285.5-Math.cos(tilt)*179];s2=add(s1,-9,3);h1=[155+Math.sin(tilt)*98,285.5-Math.cos(tilt)*98];h2=add(h1,-9,3);head=add(s1,Math.sin(tilt)*38,-Math.cos(tilt)*38);f1=[155,285.5];f2=[146,285.5];const hand1=[266.5,134],hand2=[257.5,137];a1=[s1,ik(s1,hand1,40,40,1),hand1];a2=[s2,ik(s2,hand2,40,40,1),hand2];phrase=up?'Acerca el pecho a la pared':'Empuja con control';
    }
    if(id==='march'){
      stance();
      const bounce=-4*Math.pow(Math.sin(t),2),lean=.10;
      h1=[175,195+bounce];h2=add(h1,-9,2);
      s1=add(h1,Math.sin(lean)*81,-Math.cos(lean)*81);s2=add(s1,-9,2);
      head=add(s1,Math.sin(lean)*38,-Math.cos(lean)*38);
      // Each foot rolls through support, then returns with a lifted knee.
      const foot=(offset,depth)=>{const u=(phase+offset)%1;
        if(u<.5)return[175+24*Math.cos(u*Math.PI*2)+depth,285.5];
        const v=(u-.5)*2;return[175-24*Math.cos(v*Math.PI)+depth,285.5-48*Math.pow(Math.sin(v*Math.PI),2)];
      };
      f1=foot(0,0);f2=foot(.5,-9);
      const swing=.62*Math.sin(t);
      a1=arm(s1,swing,swing+1.65);a2=arm(s2,-swing,-swing+1.65);
      phrase='Pasos ligeros · brazos alternados';
    }
    if(id==='side'||id==='jack'){
      const half=((cycle%2)+2)%2,left=half<1,u=half%1,step=(1-Math.cos(u*Math.PI*2))/2,shift=(left?-1:1)*step*20,lift=Math.pow(Math.max(0,Math.sin(u*Math.PI*2)),2)*7;
      h1=add(h1,shift,step*4);h2=add(h2,shift,step*4);s1=add(s1,shift,step*4);s2=add(s2,shift,step*4);head=add(head,shift,step*4);if(left)f1=[153-step*36,285.5-lift];else f2=[207+step*36,285.5-lift];
      const angle=id==='jack'?.1+1.5*step:.12;a1=arm(s1,-angle,-angle+.1);a2=arm(s2,angle,angle-.1);phrase=left?'Abre a la izquierda y regresa':'Abre a la derecha y regresa';
    }
    if(id==='shoulders'||id==='lateral'){
      const angle=.15+q*(id==='lateral'?1.35:1.8);a1=arm(s1,-angle,-angle+.12);a2=arm(s2,angle,angle-.12);phrase=up?'Eleva sin encoger los hombros':'Baja con control';
    }
    if(id==='curl'){a1=arm(s1,-.05,-.15-2.35*q);a2=arm(s2,.05,.15+2.35*q);phrase=up?'Flexiona sin mover los codos':'Baja lentamente';}
    if(id==='overhead'){a1=arm(s1,-(.85+2.05*q),-Math.PI);a2=arm(s2,.85+2.05*q,Math.PI);phrase=up?'Empuja sin arquear la espalda':'Regresa a la altura de hombros';}
    if(id==='bridge'||id==='press'){
      profile=true;surface='mat';s1=[105,270];s2=[105,264];head=[74,268];const angle=id==='bridge'?.48*q:0;h1=[105+79*Math.cos(angle),270-79*Math.sin(angle)];h2=add(h1,0,-6);f1=[258,285.5];f2=[253,285.5];signs=[-1,-1];
      if(id==='press'){const upper=1.33+1.61*q;a1=arm(s1,upper,Math.PI);a2=arm(s2,upper,Math.PI);}else{const b1=[183,279.5],b2=[183,273.5];a1=[s1,ik(s1,b1,40,40,-1),b1];a2=[s2,ik(s2,b2,40,40,-1),b2];}
      phrase=id==='bridge'?(up?'Eleva la pelvis sin arquear':'Baja con control'):(up?'Empuja sobre el pecho':'Baja hasta el suelo');
    }
    const legs=[[h1,ik(h1,f1,51,49,signs[0]),f1],[h2,ik(h2,f2,51,49,signs[1]),f2]];
    return {id,head,shoulders:[s1,s2],hips:[h1,h2],arms:[a1,a2],legs,profile,surface,phrase,up,weights:weights&&id!=='rest'};
  }
  window.VitalMotion={pose};
})();
