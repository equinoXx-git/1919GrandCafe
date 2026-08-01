/* ==========================================================================
   SUPABASE CLIENT — 1919 Grand Cafe Reservation System
   Phase 3: Direct REST API Integration (Zero CDN Dependencies)
   ========================================================================== */

const SUPABASE_URL = 'https://sxhkjyxruumschlqoywd.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4aGtqeXhydXVtc2NobHFveXdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NTM2MjUsImV4cCI6MjEwMTEyOTYyNX0.WCv7a9SVKDG8XsSEEz3Wj1Ciran0afgJhKcvlgIXuAE';

/**
 * Inserts reservation directly into Supabase via REST API
 * @param {Object} reservationData 
 */
window.submitReservationToSupabase = async function (reservationData) {
  const endpoint = `${SUPABASE_URL}/rest/v1/reservations`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON,
      'Authorization': `Bearer ${SUPABASE_ANON}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(reservationData)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Supabase REST Error:', response.status, errorBody);
    
    if (response.status === 401 || errorBody.includes('row-level security')) {
      throw new Error('RLS_POLICY_ERROR: Please run the RLS policy script in Supabase SQL Editor to allow public inserts.');
    }
    
    throw new Error(`Database error (${response.status}): ${errorBody}`);
  }

  const result = await response.json();
  console.log('Reservation inserted successfully into Supabase:', result);
  return result;
};
