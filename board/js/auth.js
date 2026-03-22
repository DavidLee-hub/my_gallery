// auth.js — 인증 공통 유틸리티

// 로그인 필수: 비로그인 또는 세션 만료 시 login.html로 리다이렉트
async function requireAuth() {
  const { data: { session } } = await db.auth.getSession();

  if (!session) {
    location.href = 'login.html';
    return null;
  }

  // 자동 로그인 유지 여부 확인
  const keepAlive     = localStorage.getItem('sb_keep_alive') === 'true';
  const sessionActive = sessionStorage.getItem('sb_active')   === 'true';

  if (!keepAlive && !sessionActive) {
    // 브라우저가 닫혔다가 재시작된 경우 → 강제 로그아웃
    await db.auth.signOut();
    localStorage.removeItem('sb_keep_alive');
    location.href = 'login.html';
    return null;
  }

  return session;
}

// 선택적 인증: 비로그인 시 null 반환 (리다이렉트 없음)
async function getOptionalSession() {
  const { data: { session } } = await db.auth.getSession();
  if (!session) return null;

  const keepAlive     = localStorage.getItem('sb_keep_alive') === 'true';
  const sessionActive = sessionStorage.getItem('sb_active')   === 'true';

  if (!keepAlive && !sessionActive) {
    await db.auth.signOut();
    localStorage.removeItem('sb_keep_alive');
    return null;
  }

  return session;
}

// 헤더 네비 업데이트: 닉네임(프로필 링크) + 로그아웃
function initNav(session) {
  const el = document.getElementById('nav-user');
  if (!el || !session) return;

  // 닉네임 프로필 링크 삽입
  const nickname = session.user.user_metadata?.nickname
    ?? session.user.email.split('@')[0];
  const profileLink = document.createElement('a');
  profileLink.href      = 'profile.html';
  profileLink.className = 'nav-link';
  profileLink.textContent = nickname;
  el.parentNode.insertBefore(profileLink, el);

  el.textContent = '로그아웃';
  el.addEventListener('click', async e => {
    e.preventDefault();
    await db.auth.signOut();
    localStorage.removeItem('sb_keep_alive');
    sessionStorage.removeItem('sb_active');
    location.href = 'login.html';
  });
}
