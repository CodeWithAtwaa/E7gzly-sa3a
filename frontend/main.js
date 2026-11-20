/**
 * E7gezly — Front-end demo application
 * Architecture: configuration/data → state & storage → domain helpers → UI renderers → actions → bootstrap.
 * Demo-only authentication and booking data. Use a backend API for real authorization and reservations.
 */
'use strict';

const pitches = [

  { id: 'green-arena', name: 'The Green Arena', price: 250, specs: ['5-a-side', 'FIFA Turf', 'Night Floodlights'], rating: '4.9', location: 'New Cairo', openIndex: 4, closeIndex: 14, image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=900&q=85' },

  { id: 'champions', name: 'Champions Park', price: 300, specs: ['7-a-side', 'Pro Turf', 'Premium Lights'], rating: '4.8', location: 'Nasr City', openIndex: 3, closeIndex: 13, image: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=900&q=85' },

  { id: 'the-yard', name: 'The Yard', price: 220, specs: ['5-a-side', 'HD Turf', 'Changing Rooms'], rating: '4.7', location: 'Maadi', openIndex: 5, closeIndex: 12, image: 'https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=900&q=85' },

  { id: 'stadium-x', name: 'Stadium X', price: 350, specs: ['7-a-side', 'Elite Turf', 'Pro Floodlights'], rating: '5.0', location: 'Sheikh Zayed', openIndex: 2, closeIndex: 14, image: 'https://images.unsplash.com/photo-1508098682722-e99c643e7f0b?auto=format&fit=crop&w=900&q=85' }

];

const today = new Date(); today.setHours(0, 0, 0, 0);

const days = Array.from({ length: 6 }, (_, i) => { const d = new Date(today); d.setDate(d.getDate() + i - 2); return { date: d, offset: i - 2 } });

const slots = ['12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM', '11:00 PM', '12:00 AM', '01:00 AM', '02:00 AM'];

const requestedFieldId = new URLSearchParams(window.location.search).get('field');
let selectedDayIndex = 2, selectedPitchId = pitches.some(pitch => pitch.id === requestedFieldId) ? requestedFieldId : 'green-arena', selectedStart = null;
const DEMO_OWNER_TENANTS = {
  'owner@e7gezly.demo': 'green-arena',
  'champions@e7gezly.demo': 'champions',
  'yard@e7gezly.demo': 'the-yard',
  'stadiumx@e7gezly.demo': 'stadium-x'
};
const getCurrentTenantId = () => currentUser?.role === 'owner' ? currentUser.tenantId : selectedPitchId;
const getTenantBookings = () => bookings.filter(item => item.pitchId === getCurrentTenantId());
const getTenantBlacklist = () => blacklist.filter(item => (item.pitchId || 'green-arena') === getCurrentTenantId());

let bookings = [

  { id: 1, pitchId: 'green-arena', dayOffset: 0, start: '06:00 PM', duration: 1, name: 'Omar Hassan', phone: '+20 100 555 0182', status: 'confirmed' },

  { id: 2, pitchId: 'green-arena', dayOffset: 0, start: '08:00 PM', duration: 1, name: 'Youssef Ali', phone: '+20 111 222 3344', status: 'pending' },

  { id: 3, pitchId: 'champions', dayOffset: 0, start: '09:00 PM', duration: 2, name: 'Karim Adel', phone: '+20 122 444 5566', status: 'pending' },

  { id: 4, pitchId: 'the-yard', dayOffset: 0, start: '05:00 PM', duration: 1, name: 'Mostafa Samir', phone: '+20 100 333 7788', status: 'confirmed' },

  { id: 5, pitchId: 'green-arena', dayOffset: -1, start: '07:00 PM', duration: 1, name: 'Ahmed Fathy', phone: '+20 109 888 1212', status: 'confirmed' },

  { id: 6, pitchId: 'green-arena', dayOffset: 1, start: '10:00 PM', duration: 1, name: 'Ali Nabil', phone: '+20 101 777 1212', status: 'pending' }

];

let blacklist = [{ pitchId: 'green-arena', name: 'Hossam Magdy', phone: '+20 100 000 0000', reason: 'No-show' }];

// Demo data is scoped to this tab. Replace this adapter with API calls in production.
const STORAGE_KEYS = {
  bookings: 'e7gezly.bookings',
  blacklist: 'e7gezly.blacklist',
  user: 'e7gezly.currentUser'
};

function readSessionData(key, fallback) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.warn(`Could not read ${key} from session storage.`, error);
    return fallback;
  }
}

function persistDemoState() {
  try {
    sessionStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(bookings));
    sessionStorage.setItem(STORAGE_KEYS.blacklist, JSON.stringify(blacklist));
  } catch (error) {
    console.warn('Demo state could not be persisted.', error);
  }
}

bookings = readSessionData(STORAGE_KEYS.bookings, bookings);
blacklist = readSessionData(STORAGE_KEYS.blacklist, blacklist);

function isPhoneBlocked(phone) {
  const normalizedPhone = String(phone).replace(/\D/g, '');
  return getTenantBlacklist().some(entry => String(entry.phone).replace(/\D/g, '') === normalizedPhone);
}

function getPitch(pitchId = selectedPitchId) {
  return pitches.find(pitch => pitch.id === (currentUser?.role === 'owner' ? currentUser.tenantId : pitchId)) || null;
}

function getBookingAtSlot(pitchId, dayOffset, slotIndex) {
  return bookings.find(booking => {
    if (booking.pitchId !== pitchId || booking.dayOffset !== dayOffset || booking.status === 'rejected') return false;
    const startIndex = slots.indexOf(booking.start);
    return startIndex >= 0 && slotIndex >= startIndex && slotIndex < startIndex + booking.duration;
  }) || null;
}

function canBookRange(pitchId, dayOffset, startIndex, duration) {
  if (!Number.isInteger(startIndex) || !Number.isInteger(duration) || duration < 1) return false;
  if (startIndex < 0 || startIndex + duration >= slots.length) return false;
  for (let index = startIndex; index < startIndex + duration; index += 1) {
    if (getBookingAtSlot(pitchId, dayOffset, index)) return false;
  }
  return true;
}



// 2) Shared formatting and date helpers
const fmtDate = d => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

const dayLabel = (day) => day.offset === 0
  ? 'Today'
  : day.offset === 1
    ? 'Tomorrow'
    : day.offset < 0
      ? day.date.toLocaleDateString('en-US', { weekday: 'short' })
      : day.date.toLocaleDateString('en-US', { weekday: 'short' });

// 3) Navigation and view controller
function showView(name) {
  if (name === 'owner' && currentUser?.role !== 'owner') {
    window.location.href = './Auth/signin.html?role=owner';
    return;
  }
  if (currentUser?.role === 'owner') selectedPitchId = currentUser.tenantId;

  const targetView = document.getElementById(`${name}View`);
  if (!targetView) return;

  document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
  targetView.classList.add('active');

  document.querySelectorAll('.nav-link[data-view]').forEach(link => {
    link.classList.toggle('active', link.dataset.view === name);
  });

  closeMobileMenu();

  const modePill = document.getElementById('modePill');
  if (modePill) {
    modePill.innerHTML = currentUser?.role === 'owner'
      ? '<span class="status-dot bg-amber-400"></span>Owner Mode'
      : '<span class="status-dot bg-green-400"></span>Player Mode';
  }

  if (name === 'schedule') renderSchedule();
  if (name === 'owner') renderOwner();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const toggle = document.getElementById('menuToggle');
  const isOpen = menu.classList.toggle('open');
  toggle.classList.toggle('active', isOpen);
  toggle.setAttribute('aria-expanded', String(isOpen));
  toggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
}

function closeMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const toggle = document.getElementById('menuToggle');
  if (!menu || !toggle) return;
  menu.classList.remove('open');
  toggle.classList.remove('active');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open navigation menu');
}

function navigateFromMobile(destination) {
  closeMobileMenu();
  if (destination === 'pitches') {
    showView('home');
    requestAnimationFrame(() => document.getElementById('pitches')?.scrollIntoView({ behavior: 'smooth' }));
    return;
  }
  showView(destination);
}

window.addEventListener('resize', () => {
  if (window.innerWidth > 767) closeMobileMenu();
});

// 4) UI renderers
function renderPitches() {
  // No public pitch catalogue: each tenant page represents exactly one field.
  const grid = document.getElementById('pitchGrid');
  if (grid) grid.innerHTML = '';
}

function openPitchSchedule() { showView('schedule'); renderSchedule() }

function initSelect() { if (currentUser?.role === 'owner') selectedPitchId = currentUser.tenantId; }

function renderSchedule() {

  selectedPitchId = currentUser?.role === 'owner' ? currentUser.tenantId : selectedPitchId;

  document.getElementById('dayTabs').innerHTML = days.map((d, i) => `<button onclick="selectDay(${i})" class="day-tab ${i === selectedDayIndex ? 'active' : ''} ${i < 2 ? 'past' : ''} rounded-xl px-4 py-3 text-left shrink-0"><div class="text-xs font-bold">${dayLabel(d)}</div><div class="text-[10px] opacity-65 mt-1">${fmtDate(d.date)}</div>${i === 2 ? '<div class="text-[9px] text-green-100 mt-1 font-bold">● LIVE</div>' : i < 2 ? '<div class="text-[9px] mt-1">PAST</div>' : ''}</button>`).join('');

  const d = days[selectedDayIndex], past = d.offset < 0;

  document.getElementById('scheduleDateTitle').textContent = `${selectedDayIndex === 2 ? "Today's" : fmtDate(d.date)} availability`;

  document.getElementById('dayStatus').textContent = past ? 'Historical · Read only' : selectedDayIndex === 2 ? '● Today · Live' : '● Booking open';

  document.getElementById('pastNotice').classList.toggle('hidden', !past);

  const pitch = getPitch();
  const scheduleFieldName = document.getElementById('scheduleFieldName');
  if (scheduleFieldName && pitch) scheduleFieldName.textContent = `${pitch.name} · ${slots[pitch.openIndex]}–${slots[pitch.closeIndex]} · ${pitch.price} EGP/hour`;
  const openingSlots = slots.slice(pitch?.openIndex ?? 0, pitch?.closeIndex ?? slots.length - 1);

  document.getElementById('slotGrid').innerHTML = openingSlots.map((time, visibleIndex) => {
    const i = visibleIndex + (pitch?.openIndex ?? 0);
    const slotIndex = i;
    const b = getTenantBookings().find(booking => {
      if (booking.pitchId !== selectedPitchId || booking.dayOffset !== d.offset || booking.status === 'rejected') return false;
      const bookingStart = slots.indexOf(booking.start);
      return bookingStart >= 0 && slotIndex >= bookingStart && slotIndex < bookingStart + booking.duration;
    });

    let status = b?.status || 'available';

    if (past && !b) status = 'past';

    const title = status === 'pending' ? 'Pending Approval' : status === 'confirmed' ? 'Reserved' : status === 'past' ? 'Past Slot' : 'Available';

    const sub = status === 'pending' ? 'Awaiting owner approval' : status === 'confirmed' ? 'Not available' : status === 'past' ? 'History' : currentUser?.role === 'owner' ? 'Your field · Available' : 'Tap to request';

    return `<button ${status === 'available' && !past && currentUser?.role !== 'owner' ? 'onclick="selectSlot(${i})"' : ''} class="slot ${status === 'available' ? 'available' : status === 'pending' ? 'pending' : status === 'confirmed' ? 'booked' : 'past-slot'} rounded-xl p-3 text-left ${selectedStart === i ? 'selected' : ''}">

          <div class="flex items-center justify-between gap-1"><span class="text-sm font-bold">${time}</span><i class="status-dot ${status === 'available' ? 'bg-green-400' : status === 'pending' ? 'bg-amber-400' : status === 'confirmed' ? 'bg-slate-400' : 'bg-slate-600'}"></i></div>

          <div class="text-[10px] mt-2 ${status === 'pending' ? 'text-amber-200' : status === 'confirmed' ? 'text-slate-400' : status === 'available' ? 'text-green-200' : 'text-slate-500'}">${title}</div><div class="text-[9px] mt-1 opacity-55">${sub}</div>

        </button>`;

  }).join('');

}

// 5) Booking interactions and domain rules
function selectDay(i) { selectedDayIndex = i; selectedStart = null; renderSchedule() }

function selectSlot(i) {

  if (days[selectedDayIndex].offset < 0 || !getPitch()) return;

  selectedStart = i; const p = getPitch();

  document.getElementById('modalPitch').textContent = p.name;

  document.getElementById('modalDate').textContent = fmtDate(days[selectedDayIndex].date);

  document.getElementById('modalTime').textContent = `From ${slots[i]} to ${slots[(i + 1) % slots.length]}`;

  document.getElementById('modalPrice').textContent = `${p.price.toLocaleString()} EGP`;

  document.querySelector('input[name="duration"][value="1"]').checked = true;
  const twoHourOption = document.querySelector('input[name="duration"][value="2"]');
  twoHourOption.disabled = selectedStart + 2 >= slots.length;
  twoHourOption.closest('label').classList.toggle('opacity-40', twoHourOption.disabled);

  if (currentUser?.role === 'player') {
    document.getElementById('playerName').value = currentUser.name || '';
    document.getElementById('playerPhone').value = currentUser.phone || '';
  }
  document.getElementById('bookingFormWrap').classList.remove('hidden'); document.getElementById('successWrap').classList.add('hidden');

  document.getElementById('bookingModal').classList.remove('hidden'); updateBookingDuration();

}

function updateBookingDuration() {

  const durationInput = document.querySelector('input[name="duration"]:checked');
  let duration = Number(durationInput?.value || 1);
  if (!canBookRange(selectedPitchId, days[selectedDayIndex].offset, selectedStart, duration)) {
    document.querySelector('input[name="duration"][value="1"]').checked = true;
    duration = 1;
  }

  const p = getPitch(), end = slots[selectedStart + duration] || '02:00 AM';

  document.getElementById('modalTime').textContent = `From ${slots[selectedStart]} to ${end}`;

  document.getElementById('modalPrice').textContent = `${(p.price * duration).toLocaleString()} EGP`;

  document.getElementById('durationHint').textContent = duration === 2 ? 'Two-hour booking selected. Both hours must be available.' : 'One-hour booking selected.';

}

function closeModal() { document.getElementById('bookingModal')?.classList.add('hidden') }

document.getElementById('bookingForm')?.addEventListener('submit', e => {

  e.preventDefault(); const name = document.getElementById('playerName').value.trim(), phone = document.getElementById('playerPhone').value.trim();

  if (isPhoneBlocked(phone)) { closeModal(); toast('Booking blocked', 'This account is restricted from booking. Contact the pitch owner.', 'error'); return }

  const duration = Number(document.querySelector('input[name="duration"]:checked').value), dayOffset = days[selectedDayIndex].offset;

  const occupied = !canBookRange(selectedPitchId, dayOffset, selectedStart, duration);

  if (occupied) { toast('Slot just got taken', 'Please choose another available time.', 'error'); closeModal(); renderSchedule(); return }

  bookings.push({ id: Date.now(), pitchId: getCurrentTenantId(), dayOffset, start: slots[selectedStart], duration, name, phone, status: 'pending' });
  persistDemoState();

  document.getElementById('bookingFormWrap').classList.add('hidden'); document.getElementById('successWrap').classList.remove('hidden'); renderSchedule();

});

// 6) Owner dashboard actions
function renderOwner() {
  if (currentUser?.role !== 'owner') return;
  selectedPitchId = currentUser.tenantId;
  const tenantBookings = getTenantBookings();
  const tenantBlacklist = getTenantBlacklist();
  const pitch = getPitch();
  const ownerField = document.getElementById('ownerFieldName');
  if (ownerField && pitch) ownerField.textContent = `${pitch.name} · ${pitch.location} · ${slots[pitch.openIndex]}–${slots[pitch.closeIndex]}`;
  const todayBookings = tenantBookings.filter(b => b.dayOffset === 0 && b.status !== 'rejected');

  const pending = tenantBookings.filter(b => b.status === 'pending');

  document.getElementById('pendingCount').textContent = pending.length;

  document.getElementById('confirmedCount').textContent = todayBookings.filter(b => b.status === 'confirmed').length;

  document.getElementById('blockedCount').textContent = tenantBlacklist.length;

  document.getElementById('pendingList').innerHTML = pending.length ? pending.map(b => bookingCard(b)).join('') : '<div class="text-center py-10 text-sm text-green-100/40">All clear — no pending requests.</div>';

  const matches = todayBookings.filter(b => b.status === 'confirmed');

  document.getElementById('matchesList').innerHTML = matches.length ? matches.map(b => `<div class="rounded-xl bg-white/[.035] border border-white/[.06] p-3"><div class="flex justify-between gap-3"><div><div class="font-semibold text-sm">${b.name}</div><div class="text-[11px] text-green-100/45 mt-1">${pitchName(b.pitchId)} · ${b.start} · ${b.duration}h</div></div><span class="text-[10px] text-green-300">CONFIRMED</span></div><div class="flex flex-wrap gap-2 mt-3"><a class="btn-ghost rounded-lg px-3 py-1.5 text-xs" href="https://wa.me/${b.phone.replace(/\D/g, '')}" target="_blank" rel="noopener">WhatsApp ↗</a><a class="btn-ghost rounded-lg px-3 py-1.5 text-xs" href="tel:${b.phone}">Call</a><button onclick="blockPlayer(${b.id})" class="rounded-lg px-3 py-1.5 text-xs bg-red-900/35 border border-red-800/40 text-red-200">No-Show & Block Player</button></div></div>`).join('') : '<div class="text-sm text-green-100/40 py-5 text-center">No confirmed matches today yet.</div>';

  document.getElementById('blacklistList').innerHTML = tenantBlacklist.length ? tenantBlacklist.map((b, i) => `<div class="flex justify-between items-center gap-3 rounded-xl bg-red-950/20 border border-red-900/25 p-3"><div><div class="text-sm font-semibold">${escapeHtml(b.name)}</div><div class="text-[10px] text-green-100/40">${escapeHtml(b.phone)} · ${b.reason}</div></div><button onclick="unblockPlayer(${i})" class="text-xs text-green-300 hover:text-green-100">Unblock</button></div>`).join('') : '<div class="text-sm text-green-100/40 text-center py-4">No blocked players.</div>';

}

function bookingCard(b) { return `<div class="rounded-xl bg-white/[.035] border border-amber-400/15 p-4"><div class="flex flex-wrap justify-between gap-3"><div><div class="font-bold">${escapeHtml(b.name)}</div><div class="text-xs text-green-100/45 mt-1">${escapeHtml(b.phone)}</div></div><span class="text-[10px] rounded-full bg-amber-500/10 text-amber-200 border border-amber-400/20 px-2 py-1 h-fit">PENDING</span></div><div class="text-xs text-green-100/70 mt-3">${pitchName(b.pitchId)} · ${dateForOffset(b.dayOffset)} · ${b.start} – ${(slots[slots.indexOf(b.start) + b.duration] || '02:00 AM')}</div><div class="flex gap-2 mt-4"><a class="btn-ghost rounded-lg px-3 py-2 text-xs" href="https://wa.me/${b.phone.replace(/\D/g, '')}" target="_blank" rel="noopener">WhatsApp ↗</a><button onclick="confirmBooking(${b.id})" class="btn-primary rounded-lg px-4 py-2 text-xs font-bold">Confirm Booking</button><button onclick="rejectBooking(${b.id})" class="rounded-lg border border-red-400/20 bg-red-500/10 text-red-200 px-4 py-2 text-xs">Reject</button></div></div>` }

function pitchName(id) { return pitches.find(p => p.id === id)?.name || 'Your field' }

function dateForOffset(offset) { const d = new Date(today); d.setDate(d.getDate() + offset); return fmtDate(d) }

function confirmBooking(id) { const b = bookings.find(b => b.id === id && b.pitchId === getCurrentTenantId()); if (b) { b.status = 'confirmed'; persistDemoState(); renderOwner(); renderSchedule(); toast('Booking confirmed', `${b.name}'s slot is now reserved.`) } }

function rejectBooking(id) { const b = bookings.find(b => b.id === id && b.pitchId === getCurrentTenantId()); if (b) { b.status = 'rejected'; persistDemoState(); renderOwner(); renderSchedule(); toast('Request rejected', 'The slot is available again.', 'error') } }

function blockPlayer(id) {
  const b = bookings.find(b => b.id === id && b.pitchId === getCurrentTenantId()); if (!b) return; if (!getTenantBlacklist().some(x => x.phone === b.phone)) blacklist.push({ pitchId: getCurrentTenantId(), name: b.name, phone: b.phone, reason: 'No-show' });
  persistDemoState(); renderOwner(); renderSchedule(); toast('Player blocked', 'This player will be prevented from submitting new booking requests.', 'error')
}

function unblockPlayer(i) { const entry = getTenantBlacklist()[i]; if (!entry) return; const name = entry.name; blacklist = blacklist.filter(item => item !== entry); persistDemoState(); renderOwner(); toast('Player unblocked', `${name} can request bookings again.`) }

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

function toast(title, message, type = 'success') { const el = document.createElement('div'); el.className = 'toast glass rounded-xl px-4 py-3 w-[min(340px,calc(100vw-40px))]'; el.innerHTML = `<div class="font-bold text-sm ${type === 'error' ? 'text-red-200' : 'text-green-200'}">${escapeHtml(title)}</div><div class="text-xs text-green-100/60 mt-1">${escapeHtml(message)}</div>`; document.getElementById('toastHost')?.appendChild(el); setTimeout(() => el.remove(), 3600) }

document.getElementById('bookingModal')?.addEventListener('click', e => { if (e.target.id === 'bookingModal') closeModal() });



// 7) Demo authentication state (replace with API-backed auth in production).

let currentUser = null;

let loginRole = 'player';

let signupRole = 'player';

function setAuthRole(view, role) {
  const isLogin = view === 'login';
  const playerButton = document.getElementById(isLogin ? 'loginPlayerRole' : 'signupPlayerRole');
  const ownerButton = document.getElementById(isLogin ? 'loginOwnerRole' : 'signupOwnerRole');

  if (isLogin) loginRole = role;
  else signupRole = role;

  playerButton?.classList.toggle('active', role === 'player');
  ownerButton?.classList.toggle('active', role === 'owner');

  if (!isLogin) {
    const extra = document.getElementById('ownerExtraFields');
    const pitchName = document.getElementById('signupPitchName');
    const pitchLocation = document.getElementById('signupPitchLocation');
    extra?.classList.toggle('auth-hidden', role !== 'owner');
    if (pitchName) pitchName.required = role === 'owner';
    if (pitchLocation) pitchLocation.required = role === 'owner';
  }
}

function togglePassword(id, button) {

  const input = document.getElementById(id);
  if (!input || !button) return;
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  button.textContent = show ? 'Hide' : 'Show';

}

function syncAuthNavigation() {
  const isSignedIn = Boolean(currentUser);
  const authLinks = [
    document.getElementById('navAuthButton'),
    document.getElementById('mobileAuthButton')
  ];
  const logoutButtons = [
    document.getElementById('navLogoutButton'),
    document.getElementById('mobileLogoutButton')
  ];

  authLinks.forEach(link => {
    link?.classList.toggle('hidden', isSignedIn);
    if (link) link.href = `./Auth/signin.html?field=${encodeURIComponent(selectedPitchId)}`;
  });
  logoutButtons.forEach(button => button?.classList.toggle('hidden', !isSignedIn));
  document.getElementById('ownerNavLink')?.classList.toggle('hidden', currentUser?.role !== 'owner');
  document.getElementById('mobileOwnerNavLink')?.classList.toggle('hidden', currentUser?.role !== 'owner');

  const bookButton = document.getElementById('navBookButton');
  const mobileBookButton = document.getElementById('mobileBookButton');
  if (bookButton) bookButton.classList.toggle('hidden', currentUser?.role === 'owner');
  if (mobileBookButton) mobileBookButton.classList.toggle('hidden', currentUser?.role === 'owner');

  const modePill = document.getElementById('modePill');
  if (modePill) {
    modePill.innerHTML = currentUser
      ? `<span class="status-dot ${currentUser.role === 'owner' ? 'bg-amber-400' : 'bg-green-400'}"></span>${currentUser.role === 'owner' ? 'Owner' : 'Player'} · ${escapeHtml(currentUser.name.split(' ')[0])}`
      : '<span class="status-dot bg-green-400"></span>Player Mode';
  }
}

function applyLogin(user) {
  currentUser = user;
  try {
    sessionStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    sessionStorage.setItem('e7gezly.postLoginView', user.role === 'owner' ? 'owner' : 'home');
  } catch (error) {
    console.warn('Could not persist demo user session.', error);
  }

  // Authentication pages are separate documents. Return to the landing page
  // after a successful demo sign-in/sign-up; the home page restores the session.
  if (!document.getElementById('homeView')) {
    window.location.href = '../index.html';
    return;
  }

  syncAuthNavigation();
  toast('Welcome to E7gezly', `Signed in as ${user.role === 'owner' ? 'Pitch Owner' : 'Player'}.`);
  showView(user.role === 'owner' ? 'owner' : 'home');
}

function demoLogin(role) {
  setAuthRole('login', role);
  applyLogin({
    name: role === 'owner' ? 'Demo Owner' : 'Demo Player',
    email: role === 'owner' ? 'owner@e7gezly.demo' : 'player@e7gezly.demo',
    phone: role === 'owner' ? '+201001112233' : '+201009998877',
    role, tenantId: role === 'owner' ? 'green-arena' : selectedPitchId
  });
}

const loginForm = document.getElementById('loginForm');
loginForm?.addEventListener('submit', event => {
  event.preventDefault();

  const email = document.getElementById('loginEmail')?.value.trim().toLowerCase();
  const phone = document.getElementById('loginPhone')?.value.trim();
  const password = document.getElementById('loginPassword')?.value;

  if (!email || !phone || !password) return;

  // Demo only: a real backend must verify these credentials.
  const tenantId = loginRole === 'owner' ? (DEMO_OWNER_TENANTS[email] || 'green-arena') : selectedPitchId;
  if (loginRole === 'owner' && !DEMO_OWNER_TENANTS[email]) { toast('Owner account not found', 'Owner accounts are created by the platform administrator.', 'error'); return; }
  applyLogin({ name: email.split('@')[0], email, phone, role: loginRole, tenantId });
});

const signupForm = document.getElementById('signupForm');
signupForm?.addEventListener('submit', event => {
  event.preventDefault();

  const name = document.getElementById('signupName')?.value.trim();
  const email = document.getElementById('signupEmail')?.value.trim().toLowerCase();
  const phone = document.getElementById('signupPhone')?.value.trim();
  const password = document.getElementById('signupPassword')?.value;
  const confirm = document.getElementById('signupConfirm')?.value;

  if (!name || !email || !phone || !password || !confirm) return;
  if (password !== confirm) {
    toast('Passwords do not match', 'Please make sure both password fields are identical.', 'error');
    return;
  }
  if (isPhoneBlocked(phone)) {
    toast('Account restricted', 'This phone number is currently blocked from booking.', 'error');
    return;
  }

  // Owner accounts are provisioned by the platform Super Admin, never by public sign-up.
  applyLogin({ name, email, phone, role: 'player', tenantId: selectedPitchId });
});

function logoutUser() {
  currentUser = null;
  try {
    sessionStorage.removeItem(STORAGE_KEYS.user);
  } catch (error) {
    console.warn('Could not clear demo user session.', error);
  }

  syncAuthNavigation();
  toast('Signed out', 'You have been signed out of this demo session.');
  showView('home');
}

function openResetModal() {
  const identity = document.getElementById('resetIdentity');
  const email = document.getElementById('loginEmail');
  const modal = document.getElementById('resetModal');
  if (identity && email) identity.value = email.value.trim();
  modal?.classList.remove('hidden');
}

function closeResetModal() {
  document.getElementById('resetModal')?.classList.add('hidden');
}

const resetForm = document.getElementById('resetForm');
resetForm?.addEventListener('submit', event => {
  event.preventDefault();
  const identity = document.getElementById('resetIdentity')?.value.trim();
  closeResetModal();
  toast('Reset request received', `If ${identity} is registered, password reset instructions will be sent. Demo only.`);
});

document.getElementById('resetModal')?.addEventListener('click', event => {
  if (event.target.id === 'resetModal') closeResetModal();
});


function initApp() {
  const requestedField = requestedFieldId;
  if (requestedField && pitches.some(pitch => pitch.id === requestedField)) selectedPitchId = requestedField;
  const isHomePage = Boolean(document.getElementById('homeView'));
  const authPrefix = isHomePage ? './Auth/' : './';
  document.querySelectorAll('a[href*="signin.html"]').forEach(link => { link.href = `${authPrefix}signin.html?field=${encodeURIComponent(selectedPitchId)}`; });
  document.querySelectorAll('a[href*="signup.html"]').forEach(link => { link.href = `${authPrefix}signup.html?field=${encodeURIComponent(selectedPitchId)}`; });

  if (isHomePage) {
    currentUser = readSessionData(STORAGE_KEYS.user, null);
    if (currentUser?.role === 'owner' && pitches.some(pitch => pitch.id === currentUser.tenantId)) selectedPitchId = currentUser.tenantId;
    else if (!requestedField && currentUser?.tenantId && pitches.some(pitch => pitch.id === currentUser.tenantId)) selectedPitchId = currentUser.tenantId;
    syncAuthNavigation();
    initSelect();
    renderPitches();
    const activePitch = getPitch();
    const heroPitchName = document.getElementById('heroPitchName');
    const heroPitchPrice = document.getElementById('heroPitchPrice');
    const heroPitchSpecs = document.getElementById('heroPitchSpecs');
    const heroPitchImage = document.getElementById('heroPitchImage');
    if (activePitch) {
      if (heroPitchName) heroPitchName.textContent = activePitch.name;
      if (heroPitchPrice) heroPitchPrice.textContent = `${activePitch.price} EGP/hr`;
      if (heroPitchSpecs) heroPitchSpecs.textContent = activePitch.specs.join(' · ');
      if (heroPitchImage) { heroPitchImage.src = activePitch.image; heroPitchImage.alt = activePitch.name; }
    }
    renderSchedule();
    renderOwner();

    const postLoginView = readSessionData('e7gezly.postLoginView', null);
    if (postLoginView) {
      sessionStorage.removeItem('e7gezly.postLoginView');
      if (postLoginView === 'owner' && currentUser?.role === 'owner') showView('owner');
    }
  }

  if (document.getElementById('loginForm')) {
    const requestedRole = new URLSearchParams(window.location.search).get('role');
    setAuthRole('login', requestedRole === 'owner' ? 'owner' : 'player');
  }

  if (document.getElementById('signupForm')) setAuthRole('signup', 'player');
}

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeMobileMenu();
    closeModal();
    closeResetModal();
  }
});

initApp();