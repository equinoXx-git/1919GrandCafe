/* ==========================================================================
   SUPABASE CLIENT — 1919 Grand Cafe Reservation System
   Phase 3: Database Integration
   ========================================================================== */

// ─── Supabase Configuration ───
// For Cloudflare Pages: set these as environment variables in the dashboard
// (Settings → Environment variables) and inject them at build time.
// For development, the values below are used directly.
const SUPABASE_URL  = 'https://sxhkjyxruumschlqoywd.supabase.co';
const SUPABASE_ANON = 'sb_publishable_cBCFwvBbdNq5sWppl8zlAw_ecl0OwS7';

// Initialise the Supabase client (supabase-js v2 loaded via CDN in index.html)
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

// ─── Public API: Insert Reservation ───
// Called by the form handler in script.js via window.submitReservationToSupabase
window.submitReservationToSupabase = async function (reservationData) {
  const { data, error } = await supabase
    .from('reservations')
    .insert([reservationData])
    .select();

  if (error) {
    console.error('Supabase insert error:', error);
    throw new Error(error.message || 'Failed to save reservation.');
  }

  console.log('Reservation saved:', data);
  return data;
};
