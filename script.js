// ==================== ИГРОВЫЕ ДАННЫЕ ====================
let kp = 0;
let st = 0;
let level = 1;
let taps = 0;
let streak = 0;
let lastTapTime = 0;

// Telegram Web App
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
    console.log('✅ Telegram Web App готов!');
}

// ==================== ЗВУКИ ====================
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTapSound() {
    try {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.frequency.value = 600 + Math.random() * 200;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    } catch(e) {}
}

function playLevelUpSound() {
    try {
        const notes = [523, 659, 784];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.frequency.value = freq;
                osc.type = 'sine';
                gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.15);
            }, i * 150);
        });
    } catch(e) {}
}

function playBattleSound() {
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = 400;
        osc.type = 'square';
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    } catch(e) {}
}

// ==================== ОБНОВЛЕНИЕ UI ====================
function updateUI() {
    document.getElementById('kpDisplay').textContent = kp;
    document.getElementById('stDisplay').textContent = st;
    document.getElementById('levelDisplay').textContent = level;
    document.getElementById('tapCount').textContent = taps;
    document.getElementById('streakDisplay').textContent = streak;
}

function showLevelUp() {
    const el = document.createElement('div');
    el.className = 'level-up';
    el.textContent = `🎉 УРОВЕНЬ ${level}!`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
}

// ==================== СОЗДАНИЕ ЭФФЕКТА ТАПА ====================
function createTapEffect(x, y) {
    const effect = document.createElement('div');
    effect.className = 'tap-effect';
    effect.textContent = '+1';
    effect.style.left = (x - 20) + 'px';
    effect.style.top = (y - 20) + 'px';
    
    const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#ffe66d'];
    effect.style.color = colors[Math.floor(Math.random() * colors.length)];
    
    document.body.appendChild(effect);
    setTimeout(() => effect.remove(), 800);
}

// ==================== ОБРАБОТЧИК ТАПА ====================
function handleTap(event) {
    playTapSound();
    
    const rect = document.getElementById('character').getBoundingClientRect();
    const x = event.clientX || event.touches?.[0]?.clientX || rect.left + rect.width/2;
    const y = event.clientY || event.touches?.[0]?.clientY || rect.top + rect.height/2;
    
    createTapEffect(x, y);
    
    kp += 1;
    taps += 1;
    
    const now = Date.now();
    if (now - lastTapTime < 2000) {
        streak += 1;
    } else {
        streak = 1;
    }
    lastTapTime = now;
    
    if (taps % 10 === 0) {
        st += 1;
        const stEffect = document.createElement('div');
        stEffect.className = 'tap-effect';
        stEffect.textContent = '🧠 +1';
        stEffect.style.left = (x - 30) + 'px';
        stEffect.style.top = (y - 80) + 'px';
        stEffect.style.color = '#4ecdc4';
        document.body.appendChild(stEffect);
        setTimeout(() => stEffect.remove(), 800);
    }
    
    const newLevel = Math.floor(kp / 50) + 1;
    if (newLevel > level) {
        level = newLevel;
        playLevelUpSound();
        showLevelUp();
    }
    
    updateUI();
    
    // Отправка данных в Telegram
    if (tg) {
        tg.sendData(JSON.stringify({
            action: 'tap',
            kp: kp,
            st: st,
            level: level
        }));
    }
}

// ==================== БОНУС ====================
function getBonus() {
    const bonus = 10 + streak;
    kp += bonus;
    
    const el = document.createElement('div');
    el.className = 'tap-effect';
    el.textContent = `🎁 +${bonus}`;
    el.style.left = (window.innerWidth/2 - 50) + 'px';
    el.style.top = (window.innerHeight/2 - 20) + 'px';
    el.style.fontSize = '50px';
    el.style.color = '#ff6b6b';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
    
    updateUI();
    
    if (tg) {
        tg.sendData(JSON.stringify({
            action: 'bonus',
            bonus: bonus
        }));
    }
}

// ==================== БИТВА ====================
function startBattle() {
    playBattleSound();
    
    const userScore = Math.floor(Math.random() * 50) + 50;
    const botScore = Math.floor(Math.random() * 40) + 40;
    
    if (userScore > botScore) {
        const reward = Math.floor(Math.random() * 20) + 10;
        kp += reward;
        alert(`⚔️ ПОБЕДА!\n\nТы: ${userScore}\nБот: ${botScore}\n\n📚 +${reward} очков знаний!`);
    } else {
        alert(`💔 ПОРАЖЕНИЕ...\n\nТы: ${userScore}\nБот: ${botScore}\n\n📚 +5 утешительных очков`);
        kp += 5;
    }
    
    updateUI();
    
    if (tg) {
        tg.sendData(JSON.stringify({
            action: 'battle',
            result: userScore > botScore ? 'win' : 'lose'
        }));
    }
}

// ==================== НАВЕШИВАНИЕ ОБРАБОТЧИКОВ ====================
document.getElementById('character').addEventListener('click', handleTap);
document.getElementById('character').addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleTap(e);
});

document.getElementById('bonusBtn').addEventListener('click', getBonus);
document.getElementById('battleBtn').addEventListener('click', startBattle);

// ==================== СТАРТ ====================
updateUI();
console.log('🎮 Школьный Баттл загружен!');