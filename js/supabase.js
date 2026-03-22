// supabase.js — Supabase 클라이언트 초기화
const SUPABASE_URL = 'https://ysaudonhhxkznupdgxmx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzYXVkb25oaHhrem51cGRneG14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNjk2ODIsImV4cCI6MjA4OTc0NTY4Mn0.BlZzLsFcLiiPymIVHVJYtS9tx4_TgZVvSOliSdn6YOw';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
