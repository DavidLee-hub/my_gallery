/**
 * gallery.js
 * 개인 사진 갤러리 — 동작 코드
 *
 * photos.json 에서 사진 목록을 읽어와서
 * 뷰어, 썸네일 스트립, 전체 목록 그리드를 만듭니다.
 */

// ── 설정 ──────────────────────────────────────────────────
const CONFIG = {
  siteName:      'your name',       // 사이트 이름 (헤더, 푸터에 표시)
  stripMaxCount: 10,                // 썸네일 스트립에 보여줄 최대 개수
  thumbSuffix:   '',                // 썸네일 전용 파일이 있으면 입력 (없으면 빈 문자열)
};
// ─────────────────────────────────────────────────────────


// ── 전역 상태 ──────────────────────────────────────────────
let allPhotos    = [];   // photos.json 에서 읽어온 전체 목록
let filtered     = [];   // 현재 카테고리로 필터된 목록
let currentIndex = 0;    // 뷰어에서 현재 보고 있는 사진 번호
let currentCat   = 'all';
let gridOpen     = false;


// ── DOM 요소 ───────────────────────────────────────────────
const mainImg       = document.getElementById('main-img');
const strip         = document.getElementById('strip');
const metaTitle     = document.getElementById('meta-title');
const metaSub       = document.getElementById('meta-sub');
const metaExif      = document.getElementById('meta-exif');
const photoGrid     = document.getElementById('photo-grid');
const btnPrev       = document.getElementById('btn-prev');
const btnNext       = document.getElementById('btn-next');
const btnGridToggle = document.getElementById('btn-grid-toggle');
const catBtns       = document.querySelectorAll('.cat-btn');
const footerName    = document.getElementById('footer-name');
const footerYear    = document.getElementById('footer-year');


// ── 초기화 ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  footerName.textContent = CONFIG.siteName;
  footerYear.textContent = new Date().getFullYear();
  document.querySelector('.site-name').textContent = CONFIG.siteName;

  fetch('photos.json')
    .then(res => {
      if (!res.ok) throw new Error('photos.json 을 불러올 수 없습니다.');
      return res.json();
    })
    .then(data => {
      allPhotos = data;
      applyFilter('all');
    })
    .catch(err => {
      console.error(err);
      showEmpty('사진 목록을 불러오지 못했습니다.');
    });
});


// ── 카테고리 필터 ───────────────────────────────────────────
catBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const cat = btn.dataset.cat;
    catBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCat = cat;
    applyFilter(cat);
  });
});

function applyFilter(cat) {
  filtered = cat === 'all'
    ? [...allPhotos]
    : allPhotos.filter(p => p.category === cat);

  // 날짜 내림차순 정렬
  filtered.sort((a, b) => {
    const da = a.date || '0000-00-00';
    const db = b.date || '0000-00-00';
    return db.localeCompare(da);
  });

  currentIndex = 0;

  if (filtered.length === 0) {
    showEmpty('이 카테고리에 사진이 없습니다.');
    buildStrip([]);
    buildGrid([]);
    return;
  }

  showPhoto(0);
  buildStrip(filtered);
  buildGrid(filtered);
}


// ── 메인 뷰어 ──────────────────────────────────────────────
function showPhoto(index) {
  if (filtered.length === 0) return;

  // 범위 체크
  index = Math.max(0, Math.min(index, filtered.length - 1));
  currentIndex = index;

  const photo = filtered[index];

  // 이미지 교체
  mainImg.classList.remove('loaded');
  mainImg.onload = () => mainImg.classList.add('loaded');
  mainImg.onerror = () => {
    mainImg.src = '';
    mainImg.classList.add('loaded');
  };
  mainImg.src = photo.file;
  mainImg.alt = photo.title || '';

  // 메타 정보
  updateMeta(photo);

  // 화살표 상태
  btnPrev.disabled = (index === 0);
  btnNext.disabled = (index === filtered.length - 1);

  // 썸네일 활성화
  updateStripActive(index);

  // 그리드 현재 항목 표시
  updateGridActive(index);
}

function updateMeta(photo) {
  metaTitle.textContent = photo.title
    ? `${photo.title}${photo.date ? ', ' + photo.date.substring(0, 4) : ''}`
    : '';

  const subParts = [];
  if (photo.category) subParts.push(catLabel(photo.category));
  if (photo.location) subParts.push(photo.location);
  metaSub.textContent = subParts.join('  ·  ');

  const exifList = [];
  if (photo.aperture)  exifList.push({ val: photo.aperture,  lbl: '조리개' });
  if (photo.shutter)   exifList.push({ val: photo.shutter,   lbl: '셔터' });
  if (photo.iso)       exifList.push({ val: `ISO ${photo.iso}`, lbl: '감도' });
  if (photo.focal)     exifList.push({ val: photo.focal,     lbl: '초점거리' });

  metaExif.innerHTML = exifList
    .map(e => `<div class="exif-item">
      <div class="exif-val">${e.val}</div>
      <div class="exif-lbl">${e.lbl}</div>
    </div>`)
    .join('');
}

function catLabel(cat) {
  const map = {
    'travel':       '여행사진',
    'long-exposure':'장노출',
    'typological':  '유형적',
    'series':       '연작시리즈',
    'recent':       '최근 작업',
  };
  return map[cat] || cat;
}

// 화살표 버튼
btnPrev.addEventListener('click', () => showPhoto(currentIndex - 1));
btnNext.addEventListener('click', () => showPhoto(currentIndex + 1));

// 키보드 ← →
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft')  showPhoto(currentIndex - 1);
  if (e.key === 'ArrowRight') showPhoto(currentIndex + 1);
});

// 모바일 스와이프
let touchStartX = 0;
document.querySelector('.viewer-wrap').addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
}, { passive: true });

document.querySelector('.viewer-wrap').addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) {
    if (dx < 0) showPhoto(currentIndex + 1);
    else         showPhoto(currentIndex - 1);
  }
}, { passive: true });


// ── 썸네일 스트립 ───────────────────────────────────────────
function buildStrip(photos) {
  strip.innerHTML = '';

  const showCount = Math.min(photos.length, CONFIG.stripMaxCount);

  for (let i = 0; i < showCount; i++) {
    const photo = photos[i];
    const item  = document.createElement('div');
    item.className = 'thumb-item';
    item.dataset.index = i;

    const img = document.createElement('img');
    img.src   = photo.thumb || photo.file;
    img.alt   = photo.title || '';
    img.loading = 'lazy';

    item.appendChild(img);
    item.addEventListener('click', () => showPhoto(i));
    strip.appendChild(item);
  }

  // 더보기 버튼
  if (photos.length > CONFIG.stripMaxCount) {
    const more = document.createElement('button');
    more.className = 'thumb-more';
    more.textContent = `+${photos.length - CONFIG.stripMaxCount}`;
    more.addEventListener('click', () => {
      openGrid();
    });
    strip.appendChild(more);
  }

  updateStripActive(currentIndex);
}

function updateStripActive(index) {
  const items = strip.querySelectorAll('.thumb-item');
  items.forEach((item, i) => {
    item.classList.toggle('active', i === index);
  });

  // 활성 썸네일이 보이도록 스크롤
  const activeItem = strip.querySelector('.thumb-item.active');
  if (activeItem) {
    activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
}


// ── 전체 목록 그리드 ────────────────────────────────────────
function buildGrid(photos) {
  photoGrid.innerHTML = '';

  photos.forEach((photo, i) => {
    const item = document.createElement('div');
    item.className = 'grid-item';
    item.dataset.index = i;

    const img = document.createElement('img');
    img.src     = photo.thumb || photo.file;
    img.alt     = photo.title || '';
    img.loading = 'lazy';

    item.appendChild(img);
    item.addEventListener('click', () => {
      showPhoto(i);
      closeGrid();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    photoGrid.appendChild(item);
  });

  updateGridActive(currentIndex);
}

function updateGridActive(index) {
  const items = photoGrid.querySelectorAll('.grid-item');
  items.forEach((item, i) => {
    item.classList.toggle('current', i === index);
  });
}

function openGrid() {
  gridOpen = true;
  photoGrid.classList.add('open');
  btnGridToggle.textContent = '목록 닫기';
}

function closeGrid() {
  gridOpen = false;
  photoGrid.classList.remove('open');
  btnGridToggle.textContent = '전체 목록 보기';
}

btnGridToggle.addEventListener('click', () => {
  if (gridOpen) closeGrid();
  else          openGrid();
});


// ── 빈 상태 ────────────────────────────────────────────────
function showEmpty(msg) {
  mainImg.src = '';
  mainImg.classList.remove('loaded');
  metaTitle.textContent = '';
  metaSub.textContent   = '';
  metaExif.innerHTML    = '';
  btnPrev.disabled = true;
  btnNext.disabled = true;

  const existing = document.querySelector('.empty-state');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.className = 'empty-state';
  el.textContent = msg;
  document.querySelector('.viewer-stage').appendChild(el);
}
