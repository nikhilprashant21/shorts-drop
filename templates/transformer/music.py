import json, numpy as np, wave
ev=json.load(open('events.json')); BT=ev['B']; BAR=4*BT
SR=48000; DUR=ev['dur']*BT; N=int(SR*DUR)+1
rng=np.random.default_rng(11)
bus={k:np.zeros((N,2)) for k in ['lead','bass','arp','drums','sfx']}
def put(name,sig,b,g=1.0,pan=0.0):
    i=int(round(b*BT*SR))
    if i>=N or i<0: return
    s=sig[:N-i]*g
    bus[name][i:i+len(s),0]+=s*np.sqrt((1-pan)/2)*1.414
    bus[name][i:i+len(s),1]+=s*np.sqrt((1+pan)/2)*1.414
def mtof(m): return 440*2**((m-69)/12)
NOTE={'C':0,'C#':1,'D':2,'D#':3,'E':4,'F':5,'F#':6,'G':7,'G#':8,'A':9,'A#':10,'B':11}
def n(s): return 12*(int(s[-1])+1)+NOTE[s[:-1]]
def adsr(m,a=0.004,d=0.08,sus=0.6,rel=0.03):
    t=np.arange(m)/SR; e=np.where(t<a,t/a,sus+(1-sus)*np.exp(-(t-a)/d)); r=int(rel*SR)
    if m>r: e[-r:]*=np.linspace(1,0,r)
    return e
def pulse(f,dur,duty=0.25,vib=0.0):
    m=int(dur*SR); t=np.arange(m)/SR; ff=f*(1+vib*np.sin(2*np.pi*5.5*t)*np.clip((t-0.12)/0.1,0,1))
    ph=np.mod(np.cumsum(ff)/SR,1); return np.where(ph<duty,1.0,-1.0)*0.9
def tri(f,dur):
    m=int(dur*SR); ph=np.mod(np.arange(m)*f/SR,1); return 4*np.abs(ph-0.5)-1
def lowpass(x,cut):
    X=np.fft.rfft(x); fr=np.fft.rfftfreq(len(x),1/SR); X*=1/(1+(fr/cut)**4); return np.fft.irfft(X,len(x))
def highpass(x,cut):
    X=np.fft.rfft(x); fr=np.fft.rfftfreq(len(x),1/SR); X*=1/(1+(cut/np.maximum(fr,1))**4); return np.fft.irfft(X,len(x))
def sq(f): return np.where(np.mod(np.cumsum(f)/SR,1)<0.5,1.0,-1.0)

CH=[('A',[57,60,64]),('F',[53,57,60]),('C',[48,52,55]),('G',[55,59,62])]
ROOT={'A':45,'F':41,'C':48,'G':43}
chord=lambda bar: CH[bar%4]
HOOK=[['A5','-','C6','E6','D6','-','C6','A5'],
      ['A5','-','F5','A5','C6','-','A5','G5'],
      ['G5','-','C6','E6','G6','-','E6','C6'],
      ['B5','-','D6','B5','G5','-','A5','-']]
HOOK2=[['E6','-','E6','D6','C6','A5','C6','E6'],
       ['F6','-','E6','C6','A5','-','C6','-'],
       ['G6','E6','C6','G6','E6','C6','G5','C6'],
       ['D6','-','B5','-','G5','A5','B5','-']]
def play_hook(bar0,nb,pat,g=0.15,oct_=0,echo=True):
    for k in range(nb):
        bar=bar0+k; row=pat[bar%4]; i=0
        while i<8:
            s_=row[i]
            if s_ in (None,'-'): i+=1; continue
            j=i+1
            while j<8 and row[j]=='-': j+=1
            dur=(j-i)*BT/2; m=n(s_)+12*oct_
            sig=pulse(mtof(m),dur*0.95,0.25,0.006)*adsr(int(dur*0.95*SR),0.003,0.12,0.55,0.02)
            b=bar*4+i*0.5; put('lead',sig,b,g,-0.15)
            if echo: put('lead',sig,b+0.75,g*0.3,0.5)
            i=j
def play_bass(bar0,nb,style='8th',g=0.32):
    for k in range(nb):
        bar=bar0+k; root=ROOT[chord(bar)[0]]
        steps=8 if style=='8th' else (4 if style=='q' else 1)
        for i in range(steps):
            m=root+(12 if (style=='8th' and i%2) else 0); dur=(4/steps)*BT*0.92
            put('bass',tri(mtof(m),dur)*adsr(int(dur*SR),0.002,0.12,0.8,0.02),bar*4+i*4/steps,g)
def play_arp(bar0,nb,g=0.06,rate=16):
    for k in range(nb):
        bar=bar0+k; nt=chord(bar)[1]; seq=[nt[0]+24,nt[1]+24,nt[2]+24,nt[1]+24]; st=4/rate
        for i in range(rate):
            dur=st*BT*0.8; put('arp',pulse(mtof(seq[i%4]),dur,0.125)*adsr(int(dur*SR),0.001,0.04,0.3,0.01),bar*4+i*st,g,0.35)
def kick():
    m=int(0.22*SR); t=np.arange(m)/SR; f=45+120*np.exp(-t*28)
    return np.tanh(np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*14)*1.6)
def snare():
    m=int(0.2*SR); t=np.arange(m)/SR
    return highpass(rng.standard_normal(m),900)*np.exp(-t*20)*0.7+np.sin(2*np.pi*190*t)*np.exp(-t*30)*0.5
def hat(o=False):
    m=int((0.12 if o else 0.035)*SR); t=np.arange(m)/SR
    return highpass(rng.standard_normal(m),7000)*np.exp(-t*(18 if o else 90))
def crash():
    m=int(1.8*SR); t=np.arange(m)/SR; return highpass(rng.standard_normal(m),3000)*np.exp(-t*2.0)
K,S,HC,HO,CR=kick(),snare(),hat(),hat(True),crash()
def drums(bar0,nb,kind='full',g=1.0):
    for k in range(nb):
        b0=(bar0+k)*4
        for q in range(4):
            b=b0+q
            if kind in('full','fast'): put('drums',K,b,0.55*g)
            if kind=='half' and q==0: put('drums',K,b,0.6*g)
            if kind=='half2' and q in(0,2): put('drums',K,b,0.55*g)
            if kind in('full','fast') and q in(1,3): put('drums',S,b,0.38*g,0.1)
            if kind in('half','half2') and q==2: put('drums',S,b,0.36*g,0.1)
            subs=4 if kind=='fast' else (2 if kind in('full','half2') else 1)
            for s_ in range(subs):
                o=(kind=='full' and s_==1); put('drums',HO if o else HC,b+s_/subs,(0.11 if o else 0.085)*g,-0.3)
def roll(b0,b1,g=0.35):
    st=int((b1-b0)*4)
    for i in range(st): put('drums',S,b0+i/4,g*(0.35+0.65*i/st),0.1)
def riser(b0,beats,g=0.12):
    dur=beats*BT; m=int(dur*SR); t=np.arange(m)/SR
    s=highpass(rng.standard_normal(m),500)*(t/dur)**2+sq(200*2**(t/dur*3))*0.3*(t/dur); put('sfx',s,b0,g)

# ---------------- arrangement (bars, 120 BPM) ----------------
put('drums',CR,0,0.26); drums(0,2,'fast'); play_bass(0,2,'8th'); play_hook(0,2,HOOK2,0.14)                      # hook
put('drums',CR,8,0.28); drums(2,2,'full'); play_bass(2,2,'8th'); play_hook(2,2,HOOK,0.14); play_arp(2,2,0.04,8)    # reveal 50x
put('drums',CR,16,0.22); drums(4,6,'half',0.5); play_bass(4,6,'whole',0.28); play_arp(4,6,0.035,4); play_hook(4,6,HOOK,0.07,0,False)  # steps 1-3
riser(38,2,0.12)
put('drums',CR,40,0.24); drums(10,2,'half',0.4); play_bass(10,2,'whole',0.26)                                      # multiply (200x)
put('drums',CR,48,0.26); drums(12,4,'half2',0.7); play_bass(12,4,'q',0.3); play_hook(12,4,HOOK2,0.08,0,False)      # catch + why
drums(16,1,'half',0.3); play_bass(16,1,'whole',0.22)                                                               # DC: stalls
put('drums',CR,68,0.24); drums(17,1,'half2',0.7); play_bass(17,1,'q',0.3); riser(70,2,0.13); roll(70,72,0.28)
put('drums',CR,72,0.32); drums(18,2,'fast'); play_bass(18,2,'8th',0.34); play_hook(18,2,HOOK,0.15); play_arp(18,2,0.05,16)
put('drums',CR,80,0.32); drums(20,2,'fast',1.0); play_bass(20,2,'8th',0.34); play_hook(20,2,HOOK2,0.16); play_arp(20,2,0.05,16)
put('drums',CR,87.5,0.3)

# ---------------- SFX on the grid ----------------
def blip(f0,dur=0.08):
    m=int(dur*SR); t=np.arange(m)/SR; return sq(np.where(t<dur/2,f0,f0*1.5))*np.exp(-t*30)
for e in ev['lines']: put('sfx',blip(1320 if e['big'] else 1760),e['b'],0.045)
for e in ev['labels']:
    m=int(0.1*SR); t=np.arange(m)/SR; put('sfx',np.sin(2*np.pi*np.where(t<0.05,1568,2093)*t)*np.exp(-t*25),e['b'],0.08,0.3)
# transformer hum at 100 Hz (twice 50 Hz) in real-speed sections
def hum(b0,b1,g):
    m=int((b1-b0)*BT*SR); t=np.arange(m)/SR
    x=np.sin(2*np.pi*100*t)+0.5*np.sin(2*np.pi*200*t)+0.25*np.sin(2*np.pi*300*t)+0.12*np.sign(np.sin(2*np.pi*100*t))
    env=np.minimum(1,t/0.05)*np.minimum(1,(t[-1]-t)/0.08+1e-9); put('sfx',x*env,b0,g)
for b0,b1 in ev['real']: hum(b0,b1,0.09)
# soft "whum" on each current peak in slow AC sections (alternating pitch = alternating direction)
def whum(f):
    m=int(0.35*SR); t=np.arange(m)/SR; return np.sin(2*np.pi*f*t)*np.sin(np.pi*t/t[-1])**2
for i,b in enumerate(ev['peaks']):
    if b>=40 and b<48: continue
    put('sfx',whum(110 if i%2 else 147),b-0.3,0.16)
# multiply: one rising blip per secondary turn (40 turns over beats 41..47)
for k in range(40):
    b=41+6*k/40; f=440*2**(k/40*2); put('sfx',blip(f,0.05),b,0.05,0.3*np.sin(k))
# DC: hum dies (tape-stop) then restarts at 68
m=int(1.0*BT*SR); t=np.arange(m)/SR; f=147*np.exp(-t*3); put('sfx',np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*2),64,0.2)
m=int(0.5*BT*SR); t=np.arange(m)/SR; f=60*np.exp(t/t[-1]*np.log(147/60)); put('sfx',np.sin(2*np.pi*np.cumsum(f)/SR)*(t/t[-1]),67.5,0.18)
mix=sum(bus.values())
mix=np.tanh(mix*1.25)/np.tanh(1.25); mix*=0.8/np.max(np.abs(mix))
k=int(0.06*SR); mix[-k:]*=np.linspace(1,0,k)[:,None]
with wave.open('music.wav','wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix*32767).astype('<i2').tobytes())
print('ok', DUR)
