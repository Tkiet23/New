

// Improved interaction + confetti and balloons
let pages = document.querySelectorAll(".page");
let index = 0;
let pageTimer = null;

// guest name elements
const guestInput = document.getElementById('guestName');
const setNameBtn = document.getElementById('setName');
const guestDisplay = document.getElementById('guestDisplay');

// initialize guest display (ensure default)
if(guestDisplay && guestDisplay.textContent.trim()==='') guestDisplay.textContent = 'Bạn';

// set name handler
function setGuestName(){
	if(!guestDisplay) return;
	const name = guestInput ? guestInput.value.trim() : '';
	// require a non-empty name to hide the input
	if(!name){
		if(guestInput) guestInput.focus();
		return;
	}
	guestDisplay.textContent = name;
	// animate & hide the input area
	const nameInputDiv = document.querySelector('.name-input');
	if(nameInputDiv){
		nameInputDiv.style.transition = 'opacity 260ms, transform 260ms';
		nameInputDiv.style.opacity = '0';
		nameInputDiv.style.transform = 'translateY(-8px)';
		setTimeout(()=>{ nameInputDiv.style.display = 'none'; }, 300);
	}
	// show guest page immediately and make it the first shown when cycling
	pages.forEach(p => p.classList.remove('active'));
	const guestPage = guestDisplay.closest('.page');
	if(guestPage) guestPage.classList.add('active');
	// set index so next automatic page will go to the following page
	index = 1;
	// celebration and clear input
	burstConfetti(undefined, undefined, 30);
	if(guestInput) guestInput.value = '';
		// show edit button so user can change the name later
		const editBtn = document.getElementById('editName');
		if(editBtn) editBtn.style.display = 'inline-block';
}

if(setNameBtn){
	setNameBtn.addEventListener('click', setGuestName);
}
if(guestInput){
	guestInput.addEventListener('keydown', e=>{ if(e.key==='Enter') setGuestName(); });
}

// edit name: bring input back
const editNameBtn = document.getElementById('editName');
if(editNameBtn){
	editNameBtn.addEventListener('click', ()=>{
		const nameInputDiv = document.querySelector('.name-input');
		if(nameInputDiv){
			nameInputDiv.style.display = 'flex';
			setTimeout(()=>{ nameInputDiv.style.opacity = '1'; nameInputDiv.style.transform = 'translateY(0)'; }, 10);
			const input = document.getElementById('guestName');
			if(input) input.focus();
		}
		editNameBtn.style.display = 'none';
	});
}

const openBtn = document.getElementById('open');
const resetBtn = document.getElementById('reset');
const celebrateBtn = document.getElementById('celebrate');
const musicToggleBtn = document.getElementById('musicToggle');
const music = document.getElementById('music');

resetBtn.style.display = 'none';

openBtn.onclick = () => {
	// start music (may require user interaction, clicking button qualifies)
	try { music && music.play(); } catch (e) {}

	openBtn.style.display = 'none';
	resetBtn.style.display = 'inline-block';
	showPage();
	startFireworks();
	burstConfetti();
	spawnBalloons();
};

function showPage(){
	pages.forEach(p => p.classList.remove('active'));
	if(index >= pages.length) index = 0;
	pages[index].classList.add('active');
	index++;
	if(index < pages.length){
		pageTimer = setTimeout(showPage, 2400);
	}
}

resetBtn.onclick = () => {
	// stop cycles and effects without reloading
	if(pageTimer) clearTimeout(pageTimer);
	index = 0;
	pages.forEach(p => p.classList.remove('active'));
	openBtn.style.display = 'inline-block';
	resetBtn.style.display = 'none';
	stopFireworks();
	stopConfetti();
	stopBalloons();
	if(music){ music.pause(); music.currentTime = 0; }
};

musicToggleBtn.onclick = () => {
	if(!music) return;
	if(music.paused){ music.play(); musicToggleBtn.textContent = 'Tắt Nhạc'; }
	else { music.pause(); musicToggleBtn.textContent = 'Bật Nhạc'; }
};

celebrateBtn.onclick = () =>{
	burstConfetti();
	startFireworks(1); // small burst
};

// fireworks canvas (existing)
let fwCanvas = document.getElementById('fireworks');
let fwCtx = fwCanvas.getContext('2d');
fwCanvas.width = window.innerWidth;
fwCanvas.height = window.innerHeight;
let fwParticles = [];
let fireworksInterval = null;

function startFireworks(intensity=30){
	if(fireworksInterval) return; // already running
	fireworksInterval = setInterval(()=>{
		for(let i=0;i<intensity;i++){
			fwParticles.push({
				x:Math.random()*fwCanvas.width,
				y:Math.random()*fwCanvas.height/2,
				vx:(Math.random()-0.5)*4,
				vy:(Math.random()-0.5)*4,
				life:100,
				color: 'hsl('+Math.floor(Math.random()*360)+',90%,60%)'
			});
		}
	},700);
	animateFireworks();
}

function stopFireworks(){
	if(fireworksInterval) clearInterval(fireworksInterval);
	fireworksInterval = null;
	fwParticles = [];
	fwCtx.clearRect(0,0,fwCanvas.width,fwCanvas.height);
}

function animateFireworks(){
	fwCtx.clearRect(0,0,fwCanvas.width,fwCanvas.height);
	for(let i = fwParticles.length-1; i>=0; i--){
		const p = fwParticles[i];
		p.x += p.vx; p.y += p.vy; p.life--;
		fwCtx.fillStyle = p.color;
		fwCtx.fillRect(p.x, p.y, 3, 3);
		if(p.life<=0) fwParticles.splice(i,1);
	}
	requestAnimationFrame(animateFireworks);
}

// confetti canvas & engine
let confettiCanvas = document.getElementById('confetti');
let confettiCtx = confettiCanvas.getContext('2d');
confettiCanvas.width = window.innerWidth;
confettiCanvas.height = window.innerHeight;
let confettiPieces = [];
let confettiRAF = null;

function createConfettiPiece(x,y){
	const colors = ['#ff5d8f','#ffd166','#6bf0c7','#7aa2ff','#ffb86b'];
	return {
		x:x || Math.random()*confettiCanvas.width,
		y:y || Math.random()*confettiCanvas.height/3,
		vx:(Math.random()-0.5)*6,
		vy:Math.random()*4+2,
		size:Math.random()*6+4,
		color: colors[Math.floor(Math.random()*colors.length)],
		rot: Math.random()*360,
		vr: (Math.random()-0.5)*12,
		life: Math.floor(Math.random()*80+60)
	};
}

function burstConfetti(x,y,count=80){
	for(let i=0;i<count;i++) confettiPieces.push(createConfettiPiece(x,y));
	if(!confettiRAF) animateConfetti();
}

function animateConfetti(){
	confettiCtx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);
	for(let i=confettiPieces.length-1;i>=0;i--){
		const p = confettiPieces[i];
		p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.rot += p.vr; p.life--;
		confettiCtx.save();
		confettiCtx.translate(p.x,p.y);
		confettiCtx.rotate(p.rot*Math.PI/180);
		confettiCtx.fillStyle = p.color;
		confettiCtx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
		confettiCtx.restore();
		if(p.life<=0 || p.y>confettiCanvas.height+50) confettiPieces.splice(i,1);
	}
	if(confettiPieces.length>0) confettiRAF = requestAnimationFrame(animateConfetti);
	else{ confettiRAF = null; confettiCtx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height); }
}

function stopConfetti(){
	confettiPieces = [];
	if(confettiRAF){ cancelAnimationFrame(confettiRAF); confettiRAF = null; }
	confettiCtx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);
}

// balloons creation (CSS handles float animation)
let balloonsContainer = null;
let balloonTimer = null;

function spawnBalloons(){
	if(balloonsContainer) return; // only once
	balloonsContainer = document.createElement('div');
	balloonsContainer.className = 'balloons';
	document.body.appendChild(balloonsContainer);
	const colors=['#ff6b6b','#ffb86b','#ffd166','#6bf0c7','#7aa2ff'];
	for(let i=0;i<8;i++){
		const b = document.createElement('div');
		b.className='balloon';
		b.style.left = (5 + i*11) + '%';
		b.style.background = colors[i%colors.length];
		b.style.animationDuration = (6 + Math.random()*6) + 's';
		b.style.opacity = 0.95 - Math.random()*0.25;
		b.style.transform = 'translateY(0)';
		balloonsContainer.appendChild(b);
	}
}

function stopBalloons(){
	if(balloonsContainer){ balloonsContainer.remove(); balloonsContainer = null; }
}

// small click-to-burst on card
document.querySelectorAll('.card').forEach(c => {
	c.addEventListener('click', (e)=>{ burstConfetti(e.clientX, e.clientY, 40); });
});

// handle resize
window.addEventListener('resize', ()=>{
	fwCanvas.width = confettiCanvas.width = window.innerWidth;
	fwCanvas.height = confettiCanvas.height = window.innerHeight;
});