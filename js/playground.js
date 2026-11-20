// =========================================================
// 전시관 2: 《누에와 실크의 놀이터: 비단실을 뽑는 누에와 비단이의 일상》
// 마스코트 표정 변화 & 물레 실 연결 & 비단이 전용 미션 모드 엔진 (v3)
// =========================================================

class SilkPlayground {
  constructor() {
    this.selectedChar = 'silky'; // 'silky' (누에) 또는 'bidani' (소녀)
    this.currentStep = 1;
    this.feedCount = 0;          // 뽕잎 먹인 횟수
    this.silkMeters = 0;
    this.selectedDyeColor = '#f6e05e';
    this.selectedDyeName = '치자 (황금빛)';
    this.dyedFabricData = null;  // 3단계에서 사용자가 직접 염색한 비단 이미지 (비단이 1단계로 인계)

    this.bindEvents();
    this.updateCharacterUI();
    this.initInteractiveStep(1);
  }

  // 캐릭터 선택에 따라 미션 모드(실이 모드 vs 비단이 모드) 전면 전환
  selectCharacter(charId) {
    this.selectedChar = charId;
    this.updateCharacterUI();
    this.initInteractiveStep(1); // 1단계부터 새로 로드
  }

  updateCharacterUI() {
    const cardSilky = document.getElementById('char-card-silky');
    const cardBidani = document.getElementById('char-card-bidani');
    const activeGuideName = document.getElementById('active-guide-name');
    const activeGuideSpeech = document.getElementById('active-guide-speech');
    const activeGuideAvatar = document.getElementById('active-guide-avatar');
    const step1Title = document.getElementById('step-title-1');
    const step2Title = document.getElementById('step-title-2');
    const step3Title = document.getElementById('step-title-3');

    if (this.selectedChar === 'silky') {
      cardSilky?.classList.add('selected', 'selected-silky');
      cardBidani?.classList.remove('selected');
      if (activeGuideName) activeGuideName.innerText = '포근포근 누에 요정 「실이」 (생태 & 실뽑기 장인)';
      if (activeGuideSpeech) {
        activeGuideSpeech.innerText = '“안녕! 나는 진주실크박물관의 누에 요정 실이야~ 🌿 싱싱한 뽕잎도 먹고, 반짝이는 비단실도 같이 뽑아보자!”';
      }
      if (activeGuideAvatar) activeGuideAvatar.src = 'assets/silky_mascot.png';

      // 실이 스텝 탭 제목
      if (step1Title) step1Title.innerText = '뽕잎 먹이기';
      if (step2Title) step2Title.innerText = '전통 물레 실뽑기';
      if (step3Title) step3Title.innerText = '알록달록 천연염색';
    } else {
      cardBidani?.classList.add('selected');
      cardSilky?.classList.remove('selected', 'selected-silky');
      if (activeGuideName) activeGuideName.innerText = '당찬 한복 소녀 「비단이」 (실크 활용 & 문화 가이드)';
      if (activeGuideSpeech) {
        activeGuideSpeech.innerText = '“반가워! 나는 비단이야! 진주 비단이 어떻게 곱게 재단되고 멋진 옷과 보자기, 일상 속 보물로 완성되는지 보여줄게!”';
      }
      if (activeGuideAvatar) activeGuideAvatar.src = 'assets/bidani_mascot.jpg';

      // ★ 비단이 스텝 탭 제목 전면 신설
      if (step1Title) step1Title.innerText = '비단 재단하기';
      if (step2Title) step2Title.innerText = '비단 옷 짓기';
      if (step3Title) step3Title.innerText = '일상생활에 적용하기';
    }
  }

  initInteractiveStep(step) {
    this.currentStep = step;

    document.querySelectorAll('.step-item').forEach((item, idx) => {
      if (idx + 1 === step) item.classList.add('active');
      else item.classList.remove('active');
    });

    const box = document.getElementById('mission-game-box');
    if (!box) return;

    // =========================================================
    // 모드 1: 누에 요정 「실이 모드」
    // =========================================================
    if (this.selectedChar === 'silky') {
      if (step === 1) {
        // 1단계: 뽕잎 먹이기 (공식 실이 마스코트 반영)
        this.feedCount = 0;
        box.innerHTML = `
          <div class="game-title">🌿 1단계: 누에 실이에게 싱싱한 뽕잎을 선물해요!</div>
          <div class="game-desc" style="margin-bottom: 2rem;">아래의 뽕잎 버튼을 톡톡 누르면 실이가 표정을 바꾸며 냠냠 맛있게 먹어요.</div>
          
          <div class="silky-feed-stage">
            <div id="silky-speech-bubble" class="silky-speech-bubble-box">
              “뽕잎 주면 맛있게 먹을게~ 🍃”
            </div>
            <!-- 공식 실이 마스코트 (assets/silky_mascot.png) -->
            <img src="assets/silky_mascot.png" id="silky-mascot-feed" style="width: 100%; height: 100%; object-fit: contain; transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
          </div>
          
          <div style="width: 80%; max-width: 320px; background: #e0d5c5; height: 16px; border-radius: 10px; overflow: hidden; margin: 1rem auto 1.4rem;">
            <div id="growth-bar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #48bb78, #38a169); transition: width 0.3s ease;"></div>
          </div>

          <button class="wheel-btn" id="btn-feed-leaf" style="background: #38a169; font-size: 1rem; padding: 0.8rem 2rem;">
            🍃 뽕잎 냠냠 주기 (<span id="growth-val">0</span>/4)
          </button>
        `;

        const dialogList = [
          "냠냠~ 🍃",
          "또 주는거야? ♥️",
          "행복해😄",
          "이제 실을 뽑을 수 있어😍"
        ];

        document.getElementById('btn-feed-leaf')?.addEventListener('click', () => {
          if (this.feedCount < 4) {
            this.feedCount++;
            const bubble = document.getElementById('silky-speech-bubble');
            const mascot = document.getElementById('silky-mascot-feed');
            const bar = document.getElementById('growth-bar');
            const val = document.getElementById('growth-val');

            if (bubble) bubble.innerText = `“${dialogList[this.feedCount - 1]}”`;
            if (val) val.innerText = this.feedCount;
            if (bar) bar.style.width = `${(this.feedCount / 4) * 100}%`;

            // 뽕잎 먹을 때 생동감 넘치는 반응
            if (mascot) {
              mascot.src = 'assets/silky_mascot.png';
              mascot.style.transform = 'scale(1.25) rotate(6deg)';

              setTimeout(() => {
                if (this.feedCount === 4) {
                  mascot.src = 'assets/silky_mascot.png';
                  mascot.style.transform = 'scale(1.1) rotate(0deg)';
                  box.querySelector('.game-desc').innerHTML = '<b style="color: #ff6b8b;">축하해요! 실이가 배불리 먹고 뒹굴뒹굴 행복해해요! 2단계로 가보세요! 👏</b>';
                } else {
                  mascot.src = 'assets/silky_mascot.png';
                  mascot.style.transform = 'scale(1) rotate(0deg)';
                }
              }, 450);
            }
          }
        });

      } else if (step === 2) {
        // 2단계: 실뽑기 (공식 실이 마스코트 연결)
        box.innerHTML = `
          <div class="game-title">🧵 2단계: 전통 물레를 돌려 비단실을 뽑아요!</div>
          <div class="game-desc">물레 버튼을 누르면 실이의 손에서 나온 비단실이 물레 바퀴로 사르륵 감겨요!</div>
          
          <div class="spinning-wheel-stage">
            <!-- 투명 배경 누에 마스코트 (assets/silky_mascot.png) -->
            <div style="width: 140px; height: 140px; flex-shrink: 0;">
              <img src="assets/silky_mascot.png" id="spinning-silky" style="width: 100%; height: 100%; object-fit: contain; transition: transform 0.15s ease;">
            </div>

            <!-- 누에와 물레 바퀴를 진짜로 이어주는 팽팽한 황금 비단실 라인 -->
            <div class="silk-connecting-thread" id="silk-thread-line"></div>

            <!-- 물레 바퀴 -->
            <div class="wheel-disc" id="wheel-disc" style="width: 130px; height: 130px; flex-shrink: 0;">
              🎡
            </div>
          </div>

          <div class="spool-counter">뽑아낸 비단실: <span id="silk-meter-val">${this.silkMeters}</span> m</div>
          <button class="wheel-btn" id="btn-spin-wheel" style="margin-top: 1rem;">
            ✨ 물레 팽팽하게 돌리기!
          </button>
        `;

        let rotation = 0;
        const spinBtn = document.getElementById('btn-spin-wheel');
        const wheelDisc = document.getElementById('wheel-disc');
        const silkyImg = document.getElementById('spinning-silky');
        const threadLine = document.getElementById('silk-thread-line');
        const meterVal = document.getElementById('silk-meter-val');

        const spinAction = () => {
          if (this.silkMeters >= 1500) {
            // 1,500m 달성 후 클릭 시 3단계(천연염색)로 즉시 전환
            this.initInteractiveStep(3);
            return;
          }

          rotation += 90;
          this.silkMeters = Math.min(1500, this.silkMeters + 300);
          if (wheelDisc) wheelDisc.style.transform = `rotate(${rotation}deg)`;
          if (meterVal) meterVal.innerText = this.silkMeters.toLocaleString();

          // 실이 반동 애니메이션
          if (silkyImg) {
            silkyImg.style.transform = 'translateY(-10px) rotate(-5deg)';
            setTimeout(() => silkyImg.style.transform = 'translateY(0) rotate(0deg)', 150);
          }

          // 비단실이 팽팽하게 진동
          if (threadLine) {
            threadLine.classList.add('vibrating');
            setTimeout(() => threadLine.classList.remove('vibrating'), 300);
          }

          // 1,500m 도달 시 즉시 '다음 단계로 이동하기' 버튼으로 변경
          if (this.silkMeters >= 1500) {
            box.querySelector('.game-desc').innerHTML = `<b style="color: #2e7d32; font-size: 1.05rem;">🎉 축하해요! 고치 하나 분량인 1,500m 비단실을 모두 뽑았어요! 아래 버튼을 눌러 다음 단계로 가보세요! 👏</b>`;
            if (spinBtn) {
              spinBtn.style.background = 'linear-gradient(135deg, #2e7d32, #43a047)';
              spinBtn.style.boxShadow = '0 6px 20px rgba(46, 125, 50, 0.45)';
              spinBtn.innerHTML = '✨ 1,500m 완성! 3단계(천연염색)로 이동하기 →';
            }
          }
        };

        spinBtn?.addEventListener('click', spinAction);
        wheelDisc?.addEventListener('click', spinAction);

      } else if (step === 3) {
        // 3단계: 천연 염색 브러시
        box.innerHTML = `
          <div class="game-title">🎨 3단계: 하얀 비단 천에 자연의 빛깔을 슥슥 물들여요!</div>
          <div class="game-desc">아래의 염료를 고르고, <b>하얀 비단 천 위에 마우스 커서를 올리거나 문질러보세요!</b></div>

          <div style="display: flex; gap: 0.8rem; margin: 0.8rem 0; flex-wrap: wrap; justify-content: center;">
            <button class="chip-btn active" data-dye="#f6e05e" data-dyename="치자 (황금빛)" style="padding: 0.6rem 1rem; font-weight: 700;">🟡 치자 (황금빛)</button>
            <button class="chip-btn" data-dye="#63b3ed" data-dyename="쪽 (하늘빛 남색)" style="padding: 0.6rem 1rem; font-weight: 700;">🔵 쪽 (하늘빛 남색)</button>
            <button class="chip-btn" data-dye="#f687b3" data-dyename="홍화 (고운 분홍)" style="padding: 0.6rem 1rem; font-weight: 700;">🔴 홍화 (고운 분홍)</button>
            <button class="chip-btn" data-dye="#48bb78" data-dyename="뽕잎 (연두빛)" style="padding: 0.6rem 1rem; font-weight: 700;">🟢 뽕잎 (싱그런 연두)</button>
          </div>

          <div class="dye-brush-canvas-wrap">
            <canvas id="dye-canvas" width="450" height="180"></canvas>
            <div class="dye-canvas-hint">🖌️ 마우스 커서를 올려 비단을 칠해보세요!</div>
          </div>

          <div style="display: flex; gap: 0.8rem; justify-content: center; margin-top: 1.2rem; flex-wrap: wrap;">
            <button class="chip-btn" id="btn-clear-dye" style="padding: 0.6rem 1.2rem; font-size: 0.85rem;">
              🔄 하얀 비단으로 다시 씻기
            </button>
            <button class="wheel-btn" id="btn-finish-dye-to-bidani" style="background: linear-gradient(135deg, #ff477e, #ff6b8b); padding: 0.7rem 1.8rem; font-size: 0.95rem; box-shadow: 0 4px 15px rgba(255, 71, 126, 0.4);">
              ✂️ 내가 염색한 비단으로 비단이와 옷 지으러 가기! →
            </button>
          </div>
        `;

        const dyeCanvas = document.getElementById('dye-canvas');
        if (dyeCanvas) {
          const ctx = dyeCanvas.getContext('2d');
          const initCanvas = () => {
            ctx.fillStyle = '#fdfaf5';
            ctx.fillRect(0, 0, 450, 180);
            ctx.strokeStyle = 'rgba(212, 175, 55, 0.15)';
            ctx.lineWidth = 1;
            for (let x = 0; x < 450; x += 15) {
              ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 180); ctx.stroke();
            }
            for (let y = 0; y < 180; y += 15) {
              ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(450, y); ctx.stroke();
            }
          };
          initCanvas();

          const drawColor = (e) => {
            const rect = dyeCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            ctx.fillStyle = this.selectedDyeColor;
            ctx.globalAlpha = 0.35;
            ctx.beginPath();
            ctx.arc(x, y, 22, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
          };

          dyeCanvas.addEventListener('mousemove', drawColor);
          dyeCanvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            drawColor(e.touches[0]);
          });

          document.getElementById('btn-clear-dye')?.addEventListener('click', initCanvas);

          // ★ 3번 사진 -> 4번 사진 연계: 내가 염색한 비단 캡처 후 비단이 1단계로 직행
          document.getElementById('btn-finish-dye-to-bidani')?.addEventListener('click', () => {
            this.dyedFabricData = dyeCanvas.toDataURL('image/png');
            this.selectCharacter('bidani'); // 비단이 모드로 자동 변경 및 1단계 진입
          });
        }

        box.querySelectorAll('button[data-dye]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            box.querySelectorAll('button[data-dye]').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            this.selectedDyeColor = e.currentTarget.dataset.dye;
            this.selectedDyeName = e.currentTarget.dataset.dyename;
          });
        });
      }

    // =========================================================
    // 모드 2: ★ 한복 소녀 「비단이 모드」 (신설 전용 3단계 미션)
    // =========================================================
    } else {
      if (step === 1) {
        // 비단이 1단계: 생산된 비단 재단하기 (Cutting Silk Fabric)
        // ★ 실이 3단계에서 사용자가 직접 염색한 비단이 있다면 그대로 비단 원단으로 가져옴!
        const hasCustomDyed = !!this.dyedFabricData;
        const fabricBgStyle = hasCustomDyed 
          ? `background-image: url(${this.dyedFabricData}); background-size: cover; background-position: center;`
          : `background: linear-gradient(135deg, #ffe8ee, #ffd1dc);`;

        box.innerHTML = `
          <div class="game-title">✂️ 1단계: 생산된 고운 진주 비단을 반듯하게 재단해요!</div>
          <div class="game-desc">
            ${hasCustomDyed 
              ? '<b>방금 실이와 함께 직접 염색한 알록달록 비단</b>을 가위로 톡톡 잘라 예쁜 옷감으로 만들어요!' 
              : '비단이와 함께 가위를 톡톡 눌러 옷을 지을 비단 천을 사각사각 잘라보세요.'}
          </div>
          
          <!-- 실제 잘리는 비단 스테이지 -->
          <div style="position: relative; width: 360px; height: 160px; margin: 1.5rem auto; border-radius: 16px; overflow: hidden; border: 3px dashed #ff477e; box-shadow: 0 8px 25px rgba(255, 107, 139, 0.25);">
            <!-- 왼쪽 비단 조각 -->
            <div id="fabric-half-left" style="position: absolute; left: 0; top: 0; width: 50%; height: 100%; ${fabricBgStyle} border-right: 2px dashed #ff477e; transition: transform 0.5s ease, opacity 0.5s ease; z-index: 2;">
              <span style="position: absolute; bottom: 8px; left: 12px; font-size: 0.72rem; font-weight: 800; background: rgba(255,255,255,0.85); padding: 2px 6px; border-radius: 6px; color: #ff477e;">
                ${hasCustomDyed ? '🎨 내가 염색한 비단' : '👘 진주 비단'}
              </span>
            </div>

            <!-- 오른쪽 비단 조각 -->
            <div id="fabric-half-right" style="position: absolute; right: 0; top: 0; width: 50%; height: 100%; ${fabricBgStyle} transition: transform 0.5s ease, opacity 0.5s ease; z-index: 2;">
            </div>

            <!-- 재단 절취 진행 빔 -->
            <div id="fabric-cut-line" style="position: absolute; left: 50%; top: 0; width: 3px; height: 0%; background: #ff1493; z-index: 5; transition: height 0.25s ease; box-shadow: 0 0 10px #ff1493;"></div>

            <!-- 재단 가위 아이콘 -->
            <div id="scissors-icon" style="position: absolute; left: 50%; top: -10px; font-size: 2.2rem; transform: translate(-50%, 0) rotate(90deg); transition: top 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 10; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.3));">
              ✂️
            </div>
          </div>

          <div style="font-size: 0.82rem; color: #7a6e63; margin-bottom: 1rem;" id="cut-status-msg">
            가위 버튼을 눌러 비단 천을 끝까지 싹둑 잘라주세요!
          </div>

          <button class="wheel-btn" id="btn-cut-fabric" style="background: #ff6b8b; padding: 0.85rem 2.4rem; font-size: 1rem; box-shadow: 0 4px 15px rgba(255, 107, 139, 0.4);">
            ✂️ 사각사각 재단하기 (<span id="cut-val">0</span>/4)
          </button>
        `;

        let cutCount = 0;
        const btnCut = document.getElementById('btn-cut-fabric');
        const scissors = document.getElementById('scissors-icon');
        const cutLine = document.getElementById('fabric-cut-line');
        const halfLeft = document.getElementById('fabric-half-left');
        const halfRight = document.getElementById('fabric-half-right');
        const statusMsg = document.getElementById('cut-status-msg');

        btnCut?.addEventListener('click', () => {
          if (cutCount < 4) {
            cutCount++;
            document.getElementById('cut-val').innerText = cutCount;
            const progress = cutCount * 25;
            if (cutLine) cutLine.style.height = `${progress}%`;
            if (scissors) scissors.style.top = `${progress * 1.3}px`;

            // 가위 찰칵 리액션
            if (scissors) {
              scissors.style.transform = 'translate(-50%, 0) rotate(60deg) scale(1.2)';
              setTimeout(() => {
                scissors.style.transform = 'translate(-50%, 0) rotate(90deg) scale(1.0)';
              }, 120);
            }

            if (cutCount === 4) {
              // 4회 재단 완료: 비단이 실제로 양쪽으로 갈라져 분리되는 극적 연출!
              setTimeout(() => {
                if (halfLeft) halfLeft.style.transform = 'translateX(-18px) rotate(-3deg)';
                if (halfRight) halfRight.style.transform = 'translateX(18px) rotate(3deg)';
                if (scissors) scissors.style.display = 'none';
                if (statusMsg) {
                  statusMsg.innerHTML = '<b style="color: #ff1493; font-size: 0.95rem;">✨ 싹둑! 내가 염색한 비단이 반듯하게 재단되었어요!</b>';
                }
                box.querySelector('.game-desc').innerHTML = '<b style="color: #ff477e; font-size: 1rem;">반듯하고 곱게 재단 완료! 이제 이 비단으로 고운 한복을 지으러 2단계로 가보자! 👏</b>';
                btnCut.innerHTML = '🪡 2단계: 비단 옷 지으러 가기 →';
                btnCut.style.background = 'linear-gradient(135deg, #ff8e53, #ff6b8b)';
                btnCut.onclick = () => this.initInteractiveStep(2);
              }, 250);
            }
          }
        });

      } else if (step === 2) {
        // 비단이 2단계: ★ 1단계에서 잘라진 비단 조각을 직접 꿰매어 한복을 짓는 실감 인터랙션
        const hasCustomDyed = !!this.dyedFabricData;
        const fabricBgStyle = hasCustomDyed 
          ? `background-image: url(${this.dyedFabricData}); background-size: cover; background-position: center;`
          : `background: linear-gradient(135deg, #ffe8ee, #ffd1dc);`;

        box.innerHTML = `
          <div class="game-title">🪡 2단계: 잘라낸 비단 조각을 한 땀 한 땀 바느질해요!</div>
          <div class="game-desc" id="sew-desc-text">
            1단계에서 반듯하게 잘라낸 비단 조각들을 바늘과 황금실로 꿰매어 아름다운 한복으로 지어보세요!
          </div>

          <!-- 봉제 애니메이션 스테이지 -->
          <div style="position: relative; width: 380px; height: 180px; margin: 1.5rem auto; border-radius: 18px; overflow: hidden; background: #fffcf7; border: 2px solid #ecdccb; box-shadow: inset 0 0 15px rgba(0,0,0,0.04); display: flex; align-items: center; justify-content: center;">
            
            <!-- 왼쪽 잘린 비단 조각 -->
            <div id="sew-piece-left" style="width: 140px; height: 130px; ${fabricBgStyle} border-radius: 12px 4px 4px 12px; border: 2px dashed #ff6b8b; box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateX(-24px) rotate(-3deg); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); position: relative;">
              <span style="position: absolute; bottom: 6px; left: 8px; font-size: 0.68rem; font-weight: 800; background: rgba(255,255,255,0.85); padding: 2px 6px; border-radius: 4px; color: #ff477e;">
                재단 비단 A
              </span>
            </div>

            <!-- 가운데 바느질 실 땀 라인 (지그재그 봉제선) -->
            <div id="sew-stitch-center" style="position: absolute; width: 80px; height: 130px; display: flex; flex-direction: column; align-items: center; justify-content: space-evenly; pointer-events: none; z-index: 5;">
              <div class="stitch-dot" style="opacity: 0; font-size: 1.1rem; color: #d4af37; transition: opacity 0.3s;">〰️</div>
              <div class="stitch-dot" style="opacity: 0; font-size: 1.1rem; color: #d4af37; transition: opacity 0.3s;">🧵</div>
              <div class="stitch-dot" style="opacity: 0; font-size: 1.1rem; color: #d4af37; transition: opacity 0.3s;">〰️</div>
              <div class="stitch-dot" style="opacity: 0; font-size: 1.1rem; color: #d4af37; transition: opacity 0.3s;">🧵</div>
            </div>

            <!-- 오른쪽 잘린 비단 조각 -->
            <div id="sew-piece-right" style="width: 140px; height: 130px; ${fabricBgStyle} border-radius: 4px 12px 12px 4px; border: 2px dashed #ff6b8b; box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: translateX(24px) rotate(3deg); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); position: relative;">
              <span style="position: absolute; bottom: 6px; right: 8px; font-size: 0.68rem; font-weight: 800; background: rgba(255,255,255,0.85); padding: 2px 6px; border-radius: 4px; color: #ff477e;">
                재단 비단 B
              </span>
            </div>

            <!-- 바느질 바늘 아이콘 (애니메이션) -->
            <div id="sewing-needle-icon" style="position: absolute; font-size: 2.4rem; top: 15px; left: 45%; transition: all 0.35s ease; z-index: 10; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.25));">
              🪡
            </div>

            <!-- 완성된 한복 오버레이 배지 -->
            <div id="sew-finished-hanbok" style="display: none; position: absolute; inset: 0; background: rgba(255, 253, 248, 0.95); flex-direction: column; align-items: center; justify-content: center; z-index: 20; border-radius: 18px; animation: popIn 0.4s ease;">
              <div style="font-size: 3rem;">👘</div>
              <div style="font-weight: 800; color: #2e261f; font-size: 1.05rem; margin-top: 4px;">나만의 고운 비단 한복 완성!</div>
              <div style="font-size: 0.78rem; color: #ff477e; font-weight: 700; margin-top: 2px;">내가 직접 염색하고 잘라 지은 세상에 하나뿐인 작품</div>
            </div>
          </div>

          <div style="display: flex; gap: 1rem; align-items: center; justify-content: center; margin-bottom: 1rem;">
            <div style="background: #ffffff; padding: 0.8rem 1.4rem; border-radius: 12px; border: 1.5px solid #ecdccb; text-align: left;">
              <div style="font-size: 0.92rem; font-weight: 800; color: #2e261f;" id="sew-status-text">바느질 준비 중 (0/3)</div>
              <div style="font-size: 0.78rem; color: #7a6e63; margin-top: 2px;" id="sew-sub-text">버튼을 눌러 두 비단 조각을 꿰매어주세요!</div>
            </div>
          </div>

          <button class="wheel-btn" id="btn-sew-cloth" style="background: #ff8e53; padding: 0.85rem 2.4rem; font-size: 1rem; box-shadow: 0 4px 15px rgba(255, 142, 83, 0.4);">
            🧵 한 땀 한 땀 바느질하기 (<span id="sew-step-val">0</span>/3)
          </button>
        `;

        let sewStep = 0;
        const btnSew = document.getElementById('btn-sew-cloth');
        const needle = document.getElementById('sewing-needle-icon');
        const pieceLeft = document.getElementById('sew-piece-left');
        const pieceRight = document.getElementById('sew-piece-right');
        const statusText = document.getElementById('sew-status-text');
        const subText = document.getElementById('sew-sub-text');
        const dots = document.querySelectorAll('.stitch-dot');
        const finishedOverlay = document.getElementById('sew-finished-hanbok');

        btnSew?.addEventListener('click', () => {
          if (sewStep < 3) {
            sewStep++;
            document.getElementById('sew-step-val').innerText = sewStep;

            // 바늘 콕콕 찌르는 애니메이션
            if (needle) {
              needle.style.transform = `scale(1.3) rotate(${sewStep % 2 === 0 ? 30 : -30}deg)`;
              needle.style.top = `${15 + sewStep * 35}px`;
              setTimeout(() => {
                needle.style.transform = 'scale(1.0) rotate(0deg)';
              }, 200);
            }

            if (sewStep === 1) {
              // 1회 클릭: 황금실 땀 일부 생성 & 두 비단이 가까워짐
              dots[0].style.opacity = '1';
              dots[1].style.opacity = '1';
              if (pieceLeft) pieceLeft.style.transform = 'translateX(-10px) rotate(-1deg)';
              if (pieceRight) pieceRight.style.transform = 'translateX(10px) rotate(1deg)';
              if (statusText) statusText.innerText = '저고리 깃과 소매 바느질 중... (1/3)';
              if (subText) subText.innerText = '황금 비단실이 두 조각을 팽팽하게 잇고 있어요!';

            } else if (sewStep === 2) {
              // 2회 클릭: 스티치 완성 & 두 비단이 완전히 하나로 봉제됨
              dots.forEach(d => d.style.opacity = '1');
              if (pieceLeft) {
                pieceLeft.style.transform = 'translateX(0px) rotate(0deg)';
                pieceLeft.style.borderRadius = '12px 0 0 12px';
                pieceLeft.style.borderRight = 'none';
              }
              if (pieceRight) {
                pieceRight.style.transform = 'translateX(0px) rotate(0deg)';
                pieceRight.style.borderRadius = '0 12px 12px 0';
                pieceRight.style.borderLeft = 'none';
              }
              if (statusText) statusText.innerText = '풍성한 치마 주름 봉제 완료! (2/3)';
              if (subText) subText.innerText = '두 조각이 하나로 이어져 아름다운 실루엣이 잡혔어요!';

            } else if (sewStep === 3) {
              // 3회 클릭: 완성! 한복 탄생
              if (needle) needle.style.display = 'none';
              if (finishedOverlay) finishedOverlay.style.display = 'flex';
              if (statusText) statusText.innerText = '👑 비단 한복 완성! (3/3)';
              box.querySelector('.game-desc').innerHTML = '<b style="color: #ff8e53; font-size: 1rem;">와! 내가 직접 염색하고 잘라 지은 세상에 하나뿐인 한복이 완성되었어! 👏</b>';
              
              btnSew.innerHTML = '✨ 3단계: 일상생활 속 비단 보러가기 →';
              btnSew.style.background = 'linear-gradient(135deg, #d4af37, #ff6b8b)';
              btnSew.onclick = () => this.initInteractiveStep(3);
            }
          }
        });

      } else if (step === 3) {
        // 비단이 3단계: 일상생활에 적용하기 (Silk Lifestyle & Heritage)
        box.innerHTML = `
          <div class="game-title">✨ 3단계: 우리 생활 속 반짝이는 비단의 쓰임새를 만나요!</div>
          <div class="game-desc">진주 비단은 어디에 쓰일까요? 카드를 눌러 비단의 놀라운 변신을 확인해보세요!</div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin: 1.5rem 0;">
            <div class="chip-btn" style="padding: 1rem 0.6rem; text-align: center; background: #ffffff; border: 2px solid #ecdccb;">
              <div style="font-size: 2rem;">👑</div>
              <div style="font-weight: 800; color: #2e261f; margin-top: 6px;">왕실 곤룡포 & 혼례복</div>
              <div style="font-size: 0.72rem; color: #7a6e63; margin-top: 2px;">귀한 날 입는 품격 의복</div>
            </div>

            <div class="chip-btn" style="padding: 1rem 0.6rem; text-align: center; background: #ffffff; border: 2px solid #ecdccb;">
              <div style="font-size: 2rem;">🎁</div>
              <div style="font-weight: 800; color: #2e261f; margin-top: 6px;">규방 비단 보자기</div>
              <div style="font-size: 0.72rem; color: #7a6e63; margin-top: 2px;">복을 담아 선물하는 예술</div>
            </div>

            <div class="chip-btn" style="padding: 1rem 0.6rem; text-align: center; background: #ffffff; border: 2px solid #ecdccb;">
              <div style="font-size: 2rem;">🧣</div>
              <div style="font-weight: 800; color: #2e261f; margin-top: 6px;">현대 패션 스카프</div>
              <div style="font-size: 0.72rem; color: #7a6e63; margin-top: 2px;">세계 런웨이를 빛내는 멋</div>
            </div>
          </div>

          <div style="font-size: 0.9rem; font-weight: 700; color: #ff6b8b;">
            “진주 비단은 천 년 동안 우리 삶을 가장 아름답고 따뜻하게 감싸준 최고의 선물이야!”
          </div>
        `;
      }
    }
  }

  // QR 유물 도슨트 해설
  showArtifactDocent(artifactId) {
    const modal = document.getElementById('docent-modal');
    const modalTitle = document.getElementById('docent-title');
    const modalDesc = document.getElementById('docent-desc');
    const modalCharName = document.getElementById('docent-char-tag');

    const isSilky = this.selectedChar === 'silky';
    modalCharName.innerText = isSilky ? '누에 요정 실이의 해설' : '소녀 비단이의 해설';

    if (artifactId === 'ex-1') {
      modalTitle.innerText = '유물 No.1 전통 베틀 (Loom)';
      modalDesc.innerText = isSilky 
        ? '“내가 열심히 뽑아낸 비단실 수천 가닥을 날실과 씨실로 엮어 옷감으로 짜내는 기구야! 발판을 밟으면 바디가 철컥철컥 소리를 내며 튼튼한 비단이 탄생한단다!”'
        : '“우리 조상님들은 이 베틀로 비단을 짜서 왕실의 기품 있는 곤룡포와 예쁜 색동 한복을 지으셨어! 귀한 손님께 드리는 복주머니와 비단 보자기의 시작도 바로 이 베틀이란다!”';
    } else if (artifactId === 'ex-2') {
      modalTitle.innerText = '유물 No.2 진주실크 오색 타래';
      modalDesc.innerText = isSilky
        ? '“누에고치 하나에서 나오는 실의 길이가 무려 1,500미터나 돼! 그 귀한 실을 정성껏 모아 천연 염료에 물들인 보물 실타래란다.”'
        : '“진주실크는 우리나라 실크 생산량의 대부분을 차지해! 세계적인 패션쇼의 고급 이브닝 드레스, 감각적인 실크 스카프, 넥타이까지 진주실크는 지금도 온 세상 패션을 빛내고 있어!”';
    }

    if (modal) modal.style.display = 'flex';
  }

  // 장인 임명장 발급
  generateCertificate() {
    const nameInput = document.getElementById('cert-user-name');
    const userName = (nameInput && nameInput.value.trim()) || '어린이 장인';

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#fdfaf5';
    ctx.fillRect(0, 0, 800, 1000);

    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 14;
    ctx.strokeRect(30, 30, 740, 940);

    ctx.strokeStyle = '#ecd580';
    ctx.lineWidth = 2;
    ctx.strokeRect(45, 45, 710, 910);

    ctx.fillStyle = '#b8860b';
    ctx.font = 'bold 22px Pretendard, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('진 주 실 크 박 물 관', 400, 110);

    ctx.fillStyle = '#2c221a';
    ctx.font = 'bold 44px Pretendard, sans-serif';
    ctx.fillText('명 예 실 크 장 인 임 명 장', 400, 190);

    ctx.fillStyle = '#ff6b8b';
    ctx.font = 'bold 36px Pretendard, sans-serif';
    ctx.fillText(`수여자 : ${userName} 님`, 400, 290);

    ctx.fillStyle = '#55483d';
    ctx.font = '22px Pretendard, sans-serif';
    const lines = [
      '위 사람은 진주실크박물관 디지털 체험 전시관',
      '《누에와 실크의 놀이터》에서 뽕잎 먹이기와',
      '전통 물레 돌리기, 비단 재단과 옷 짓기 탐구를 모두 훌륭히 완수하여,',
      '진주실크의 아름다움과 전통을 널리 알릴',
      '자랑스러운 제1호 명예 진주실크 장인으로 임명합니다.'
    ];
    lines.forEach((line, i) => {
      ctx.fillText(line, 400, 380 + (i * 40));
    });

    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 24px Pretendard, sans-serif';
    ctx.fillText(`함께한 도슨트 친구 : ${this.selectedChar === 'silky' ? '누에 요정 실이' : '한복 소녀 비단이'}`, 400, 640);

    ctx.strokeStyle = '#c53030';
    ctx.fillStyle = '#c53030';
    ctx.lineWidth = 4;
    ctx.strokeRect(350, 730, 100, 100);
    ctx.font = 'bold 22px Pretendard, sans-serif';
    ctx.fillText('진주', 400, 770);
    ctx.fillText('실크', 400, 805);

    const today = new Date();
    const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
    ctx.fillStyle = '#7a6f64';
    ctx.font = '18px Pretendard, sans-serif';
    ctx.fillText(dateStr, 400, 890);

    const finalUrl = canvas.toDataURL('image/png');
    const preview = document.getElementById('cert-preview-img');
    if (preview) preview.src = finalUrl;

    const downloadBtn = document.getElementById('cert-download-link');
    if (downloadBtn) {
      downloadBtn.href = finalUrl;
      downloadBtn.download = `Jinju_Silk_Certificate_${userName}.png`;
    }

    document.getElementById('cert-modal').style.display = 'flex';
  }

  bindEvents() {
    document.getElementById('char-card-silky')?.addEventListener('click', () => this.selectCharacter('silky'));
    document.getElementById('char-card-bidani')?.addEventListener('click', () => this.selectCharacter('bidani'));

    document.querySelectorAll('.step-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const step = parseInt(e.currentTarget.dataset.step);
        this.initInteractiveStep(step);
      });
    });

    document.querySelectorAll('.qr-artifact-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.showArtifactDocent(e.currentTarget.dataset.artifact);
      });
    });

    document.getElementById('btn-get-cert')?.addEventListener('click', () => this.generateCertificate());
  }
}

window.SilkPlayground = SilkPlayground;
