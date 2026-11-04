
/* One block per role (Yuvaraj, 3 Nov): a change asked for one role goes in that role's block below and never touches the others.
   Shared screens stay as they are; a role block overrides a hook only while that role is logged in.
   Hooks: subs (Inpatients menu), ipdPage (patient lists), vPatient (patient profile), render (routing), myday (Inpatient dashboard). */
const ROLE={lead:{},psychiatrist:{},psychologist:{},nurse:{},rmo:{}};
const roleHook=k=>(ROLE[S.role]||{})[k];
const __rb_subs=V3.subs;V3.subs=function(sec){const f=roleHook('subs');return f?f(sec,__rb_subs):__rb_subs(sec);};
const __rb_ipd=ipdPage;ipdPage=function(o){const f=roleHook('ipdPage');return f?f(o,__rb_ipd):__rb_ipd(o);};
const __rb_vp=vPatient;vPatient=function(sub){const f=roleHook('vPatient');return f?f(sub,__rb_vp):__rb_vp(sub);};
const __rb_render=render;render=function(){const f=roleHook('render');return f?f(__rb_render):__rb_render.apply(this,arguments);};
['vMyDay','vNurseDay','vRmoDay'].forEach(n=>{const b=window[n];window[n]=function(){const f=roleHook('myday');return f?f(b):b.apply(this,arguments);};});
