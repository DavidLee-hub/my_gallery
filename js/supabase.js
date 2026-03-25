// supabase.js — Supabase 클라이언트 초기화
const SUPABASE_URL = 'https://ysaudonhhxkznupdgxmx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzYXVkb25oaHhrem51cGRneG14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNjk2ODIsImV4cCI6MjA4OTc0NTY4Mn0.BlZzLsFcLiiPymIVHVJYtS9tx4_TgZVvSOliSdn6YOw';

// Edge 추적 방지 대응: localStorage 차단 시 sessionStorage → memory 순으로 폴백
const _memStore = {};
const _safeStorage = {
  getItem(key) {
    try { return window.localStorage.getItem(key); } catch (_) {}
    try { return window.sessionStorage.getItem(key); } catch (_) {}
    return _memStore[key] ?? null;
  },
  setItem(key, value) {
    try { window.localStorage.setItem(key, value); return; } catch (_) {}
    try { window.sessionStorage.setItem(key, value); return; } catch (_) {}
    _memStore[key] = value;
  },
  removeItem(key) {
    try { window.localStorage.removeItem(key); } catch (_) {}
    try { window.sessionStorage.removeItem(key); } catch (_) {}
    delete _memStore[key];
  }
};

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: _safeStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
