window.__RAW='https://raw.githubusercontent.com/nikhilprashant21/shorts-drop/main/yt/';
window.__sl=ms=>new Promise(r=>setTimeout(r,ms));
window.__fetchFile=async(n,t)=>{const b=await (await fetch(__RAW+n)).blob();return new File([b],n,{type:t});};
window.__setInput=(inp,f)=>{const dt=new DataTransfer();dt.items.add(f);inp.files=dt.files;inp.dispatchEvent(new Event('change',{bubbles:true}));};
window.__setText=(i,txt)=>{const el=[...document.querySelectorAll('ytcp-uploads-dialog #textbox[contenteditable=true]')][i];el.focus();el.innerText=txt;el.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:txt}));el.dispatchEvent(new Event('change',{bubbles:true}));el.blur();return el.textContent.slice(0,30);};
window.__full=async(v,title,desc,day,time)=>{const out=[];window.__log=out;const D=()=>document.querySelector('ytcp-uploads-dialog');
 try{
  for(let i=0;i<20&&!document.querySelector('ytcp-uploads-file-picker input[type=file]');i++)await __sl(500);
  __setInput(document.querySelector('ytcp-uploads-file-picker input[type=file]'),await __fetchFile(v+'.mp4','video/mp4'));out.push('video');
  for(let i=0;i<60&&document.querySelectorAll('ytcp-uploads-dialog #textbox[contenteditable=true]').length<2;i++)await __sl(500);
  await __sl(1500);out.push(__setText(0,title));__setText(1,desc);
  document.querySelector('tp-yt-paper-radio-button[name=VIDEO_MADE_FOR_KIDS_NOT_MFK]')?.click();
  const ti=D().querySelector('input#file-loader');if(ti){__setInput(ti,await __fetchFile(v+'.jpg','image/jpeg'));out.push('thumb');}else out.push('NO THUMB');
  await __sl(2500);for(let i=0;i<3;i++){D().querySelector('#next-button')?.click();await __sl(1500);}
  const sch=[...D().querySelectorAll('ytcp-video-visibility-select *')].find(e=>e.children.length===0&&e.textContent.trim()==='Schedule');sch.click();await __sl(1200);
  const tr=D().querySelector('ytcp-visibility-scheduler #datepicker-trigger');tr.click();await __sl(900);
  [...document.querySelectorAll('ytcp-date-picker span.calendar-day')].find(e=>e.textContent.trim()===String(day)).click();await __sl(900);
  const pi=D().querySelector('ytcp-visibility-scheduler tp-yt-paper-input#textbox');(pi.querySelector('input')||pi).click();await __sl(900);
  const it=[...document.querySelectorAll('tp-yt-paper-item')].find(e=>e.offsetParent&&e.textContent.trim()===time);it.click();await __sl(900);
  out.push('sched '+tr.textContent.trim()+' '+pi.value);
  out.push([...D().querySelectorAll('a')].map(a=>a.href).find(h=>/shorts\/|youtu\.be/.test(h)));
  for(let i=0;i<120;i++){const s=D().querySelector('ytcp-video-upload-progress')?.textContent||'';if(/Checks complete/i.test(s))break;await __sl(5000);}
  const b=D().querySelector('#done-button');if(b.getAttribute('aria-disabled')==='true'){out.push('BUTTON DISABLED: '+[...D().querySelectorAll('ytcp-visibility-scheduler [class*=error]')].map(e=>e.textContent.trim()).join('/'));return;}
  b.click();await __sl(7000);out.push((document.querySelector('ytcp-video-share-dialog')?.textContent||'no share dialog').replace(/\s+/g,' ').slice(0,90));out.push('DONE');
 }catch(e){out.push('ERR '+e.message);}};
