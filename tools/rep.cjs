/* helper for edit scripts: exact single-match replacements, keeps the file's line endings */
const fs=require('fs');
module.exports=function(file,pairs){let t=fs.readFileSync(file,'utf8');const crlf=t.includes('\r\n');
 for(let [a,b] of pairs){if(crlf){a=a.replace(/\r?\n/g,'\r\n');b=b.replace(/\r?\n/g,'\r\n');}
 const n=t.split(a).length-1;if(n!==1)throw new Error(file+' match '+n+': '+a.slice(0,90));t=t.split(a).join(b);}
 fs.writeFileSync(file,t);console.log('ok',file);};
