import sys, json, subprocess, argparse, numpy as np, wave, os, tempfile
ap=argparse.ArgumentParser(); ap.add_argument('inp'); ap.add_argument('out')
ap.add_argument('--style',default='chiptune'); ap.add_argument('--level',type=float,default=-26)
a=ap.parse_args(); SR=44100; tmp=tempfile.mkdtemp()
dur=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',a.inp]))
has_audio=bool(subprocess.run(['ffprobe','-v','error','-select_streams','a','-show_entries','stream=index','-of','csv=p=0',a.inp],capture_output=True,text=True).stdout.strip())
N=int(dur*SR)
if has_audio:
    subprocess.run(['ffmpeg','-v','error','-y','-i',a.inp,'-ac','2','-ar',str(SR),f'{tmp}/a.wav'],check=True)
    w=wave.open(f'{tmp}/a.wav'); x=np.frombuffer(w.readframes(w.getnframes()),'<i2').reshape(-1,2)/32768.0; x=np.pad(x,((0,max(0,N-len(x))),(0,0)))[:N]
else: x=np.zeros((N,2))
mono=x.mean(1)
# envelope (50 ms)
hop=int(0.05*SR); fr=len(mono)//hop
rms=np.sqrt(np.mean(mono[:fr*hop].reshape(fr,hop)**2,1)+1e-12); db=20*np.log10(rms); peak=db.max()
quiet=db<peak-30
# keep only quiet runs >= 0.4 s
q=quiet.copy(); i=0
while i<fr:
    if quiet[i]:
        j=i
        while j<fr and quiet[j]: j+=1
        if (j-i)*0.05<0.4: q[i:j]=False
        i=j
    else: i+=1
# tempo from spectral flux
win=2048; hp=512; nf=(len(mono)-win)//hp
if nf>8 and peak>-60:
    F=np.abs(np.fft.rfft(np.stack([mono[k*hp:k*hp+win]*np.hanning(win) for k in range(nf)]),axis=1))
    fq=np.fft.rfftfreq(win,1/SR)
    flux=np.maximum(0,np.diff(np.log1p(F*10),axis=0)).sum(1); flux-=flux.mean()
    fps=SR/hp; ac=np.correlate(flux,flux,'full')[len(flux)-1:]
    lags=np.arange(int(fps*60/180),int(fps*60/70)); best=lags[np.argmax(ac[lags])]
    y0,y1,y2=ac[best-1],ac[best],ac[best+1]; frac=0.5*(y0-y2)/(y0-2*y1+y2+1e-12)
    conf=ac[best]/(ac[0]+1e-9); bpm=60*fps/(best+frac)
    if abs(bpm-round(bpm))<0.35: bpm=float(round(bpm))
    # phase from the kick band (< 150 Hz) so the grid lands on the downbeat drums, not off-beat hats
    kb=np.maximum(0,np.diff(np.log1p(F[:,fq<150]*10),axis=0)).sum(1)
    per=fps*60/bpm; tt=np.arange(len(kb))
    os_=np.arange(0,per,0.25); scores=[kb[np.round(np.arange(o,len(kb)-1,per)).astype(int)].sum() for o in os_]
    offset=(os_[int(np.argmax(scores))]+1)/fps+win/2/SR  # +1 frame for diff(), + half window to the window centre
    # key from a long-window chroma (80-1000 Hz)
    W2=8192; fq2=np.fft.rfftfreq(W2,1/SR); ok=(fq2>80)&(fq2<1000); pcs=(np.round(12*np.log2(fq2[ok]/440))+9)%12
    C=np.zeros(12)
    for k in range(0,len(mono)-W2,W2//2):
        sp=np.abs(np.fft.rfft(mono[k:k+W2]*np.hanning(W2)))[ok]**2
        for p in range(12): C[p]+=sp[pcs==p].sum()
else: conf=0; bpm=110; offset=0; C=np.zeros(12)
if conf<0.2:
    bpm=110
    sc=subprocess.run(['ffmpeg','-i',a.inp,'-vf',r'select=gt(scene\,0.3),showinfo','-f','null','-'],capture_output=True,text=True).stderr
    ts=[float(s.split('pts_time:')[1].split()[0]) for s in sc.splitlines() if 'pts_time:' in s]
    offset=ts[0] if ts else 0
maj=np.array([6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88]); mnr=np.array([6.33,2.68,3.52,5.38,2.6,3.53,2.54,4.75,3.98,2.69,3.34,3.17])
if C.sum()>0:
    sc_=[(np.corrcoef(np.roll(t,k),C)[0,1],k,m) for k in range(12) for t,m in ((maj,'maj'),(mnr,'min'))]; _,root,mode=max(sc_)
else: root,mode=9,'min'
mr=root if mode=='min' else (root+9)%12
B=60/bpm; bar=4*B
def mt(m): return 440*2**((m-69)/12)
def osc(f,d,kind):
    t=np.arange(int(d*SR))/SR; ph=np.mod(f*t,1)
    return {'sq':np.where(ph<0.25,1.,-1.),'tri':4*np.abs(ph-0.5)-1,'saw':2*ph-1,'sin':np.sin(2*np.pi*ph)}[kind]
def env(n,a_,r):
    e=np.ones(n); A=min(n,int(a_*SR)); R=min(n,int(r*SR))
    if A: e[:A]=np.linspace(0,1,A)
    if R: e[-R:]*=np.linspace(1,0,R)
    return e
def lp(s,c): X=np.fft.rfft(s); f=np.fft.rfftfreq(len(s),1/SR); return np.fft.irfft(X/(1+(f/c)**4),len(s))
bed=np.zeros(N); lead_k={'chiptune':'sq','lofi':'tri','ambient':'sin'}[a.style]
prog=[0,8,3,10]  # i VI III VII (semitones from the minor root)
rng=np.random.default_rng(1)
def put(s,t,g):
    i=int(t*SR)
    if i<0: s=s[-i:]; i=0
    if i<N: s=s[:N-i]; bed[i:i+len(s)]+=s*g
t=offset-np.ceil(offset/bar)*bar; k=0
while t<dur:
    rt=48+mr+prog[k%4]
    ch=[rt+12,rt+12+(3 if prog[k%4]==0 else 4),rt+19]
    for m in ch: put(osc(mt(m),bar,'saw' if a.style!='chiptune' else 'tri')*env(int(bar*SR),0.3,0.4),t,0.05)
    put(osc(mt(rt-12),bar*0.95,'tri')*env(int(bar*0.95*SR),0.01,0.2),t,0.18)
    for b in range(4):
        tb=t+b*B
        if b in(0,2):
            n=int(0.2*SR); tt=np.arange(n)/SR; put(np.sin(2*np.pi*np.cumsum(45+90*np.exp(-tt*30))/SR)*np.exp(-tt*16),tb,0.35)
        for h in range(2): n=int(0.03*SR); put(np.diff(rng.standard_normal(n+1))*np.exp(-np.arange(n)/SR*120),tb+h*B/2,0.03)
        if a.style!='ambient':
            for s in range(2):
                m=ch[(b*2+s)%3]+12; d=B/2*0.8; put(osc(mt(m),d,lead_k)*env(int(d*SR),0.003,0.05),tb+s*B/2,0.03)
    t+=bar; k+=1
bed=lp(bed,3500 if a.style=='chiptune' else 2200); bed/=np.max(np.abs(bed))+1e-9
base=10**(a.level/20); lift=10**((a.level+9)/20)
gf=np.where(q,lift,base)*(1-0.6*np.clip((db-(peak-30))/30,0,1))
k_=int(0.3/0.05); gf=np.convolve(gf,np.ones(k_)/k_,'same')
g=np.interp(np.arange(N)/SR,np.arange(fr)*0.05,gf)
fade=np.minimum(1,np.minimum(np.arange(N)/(0.5*SR),(N-np.arange(N))/(1.0*SR)))
ref=10**(peak/20) if peak>-60 else 0.3
mix=x+(bed*g*fade*ref*2.0)[:,None]
mix=np.tanh(mix*1.1)/np.tanh(1.1); mix*=min(1,0.89/np.max(np.abs(mix)))
w=wave.open(f'{tmp}/m.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix*32767).astype('<i2').tobytes()); w.close()
subprocess.run(['ffmpeg','-v','error','-y','-i',a.inp,'-i',f'{tmp}/m.wav','-map','0:v','-map','1:a','-c:v','copy','-c:a','aac','-b:a','192k','-shortest',a.out],check=True)
names=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
print(json.dumps({'bpm':round(float(bpm),1),'beat_confidence':round(float(conf),2),'beat_offset_s':round(float(offset),3),'key':names[root]+' '+mode,'quiet_percent':round(100*float(q.mean()),1),'style':a.style,'level_db':a.level,'had_audio':has_audio},indent=1))
