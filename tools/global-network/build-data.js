const fs=require('fs');const cities=require('./cities');const d=JSON.parse(fs.readFileSync(process.argv[2]));
const out=[],miss=[];
d.forEach(c=>{const hay=[c.address||'',c.name];let hit=null;for(const h of hay){hit=cities.find(([re])=>re.test(h));if(hit)break}
 if(!hit){miss.push(c.region+' | '+c.name+' | '+(c.address||''));}
 out.push({r:c.region,n:c.name.replace(/\s+/g,' ').trim(),a:(c.address||'').trim(),b:(c.business||'').trim(),u:c.url||'',loc:hit?hit[1]:'',lat:hit?hit[2]:null,lon:hit?hit[3]:null})});
console.error('unmatched:\n'+miss.join('\n'));console.error('locations',new Set(out.filter(o=>o.loc).map(o=>o.loc)).size,'pinned',out.filter(o=>o.loc).length);
fs.writeFileSync(process.argv[3],JSON.stringify(out));
