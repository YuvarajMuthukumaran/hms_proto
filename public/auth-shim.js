/* 15 Nov 2026: real logins. The database answers only signed-in staff (supabase/migrations/20261115000000_auth_lock.sql).
   The record sync uses the signed-in client, but older screens (registry, PX pages, reports, ...) call the REST API directly
   with the public key. This adds the signed-in user's token to every such call. The session is the one supabase-js keeps in
   localStorage (key sb-<project>-auth-token); every page of the portal is on the same origin, so the embedded PX pages see it too.
   Loaded first in index.html and in every page under public/px and public/lead. */
(function(){
  if(window.__tulasiAuthShim)return;window.__tulasiAuthShim=1;
  function token(){
    try{
      for(var i=0;i<localStorage.length;i++){
        var k=localStorage.key(i);
        if(/^sb-.*-auth-token$/.test(k)){var v=JSON.parse(localStorage.getItem(k)||'null');var t=v&&(v.access_token||(v.currentSession&&v.currentSession.access_token));if(t)return t;}
      }
    }catch(e){}
    return '';
  }
  var f0=window.fetch;
  window.fetch=function(input,init){
    try{
      var url=typeof input==='string'?input:(input&&input.url)||'';
      if(/\.supabase\.co\/(rest|storage)\/v1\//.test(url)){
        var t=token();
        if(t){
          init=Object.assign({},init||{});
          var h=new Headers(init.headers||(typeof input!=='string'&&input.headers)||{});
          h.set('Authorization','Bearer '+t);
          init.headers=h;
        }
      }
    }catch(e){}
    return f0.call(this,input,init);
  };
})();
