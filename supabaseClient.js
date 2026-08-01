/* ==========================================================================
   SUPABASE CLIENT — 1919 Grand Cafe Reservation System
   Phase 3: Database Integration
   ========================================================================== */

const SUPABASE_URL  = 'https://sxhkjyxruumschlqoywd.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4aGtqeXhydXVtc2NobHFveXdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NTM2MjUsImV4cCI6MjEwMTEyOTYyNX0.WCv7a9SVKDG8XsSEEz3Wj1Ciran0afgJhKcvlgIXuAE';

let supabaseInstance = null;

function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance;
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    supabaseInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
    return supabaseInstance;
  }
  return null;
}

// ─── Public API: Insert Reservation ───
window.submitReservationToSupabase = async function (reservationData) {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase SDK not initialized. Verify script CDN tag.');
  }

  // Attempt insert with all fields
  let { data, error } = await client
    .from('reservations')
    .insert([reservationData])
    .select();

  // Graceful fallback if 'email' column is missing in user's Supabase schema
  if (error && error.message && error.message.toLowerCase().includes('email')) {
    console.warn('Retrying Supabase insert without email column:', error.message);
    const fallbackData = { ...reservationData };
    delete fallbackData.email;
    
    const retry = await client
      .from('reservations')
      .insert([fallbackData])
      .select();
      
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    console.error('Supabase insert error details:', error);
    throw new Error(error.message || 'Failed to save reservation to Supabase.');
  }

  console.log('Reservation saved to Supabase:', data);
  return data;
};
