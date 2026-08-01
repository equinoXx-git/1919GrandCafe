-- =======================================================
-- PHASE 1: SUPABASE DATABASE SCHEMA & RLS POLICIES
-- Project: 1919 Grand Cafe Reservation System
-- =======================================================

-- 1. Create reservations table
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time TEXT NOT NULL,
    guests INTEGER NOT NULL DEFAULT 1,
    seating_preference TEXT,
    special_requests TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure email column exists if table was created previously
ALTER TABLE public.reservations 
    ADD COLUMN IF NOT EXISTS email TEXT;

-- Constraint for status validation
ALTER TABLE public.reservations 
    ADD CONSTRAINT check_status 
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'));

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- 3. Clean up existing policies
DROP POLICY IF EXISTS "Allow public insert reservations" ON public.reservations;
DROP POLICY IF EXISTS "Allow admin select reservations" ON public.reservations;
DROP POLICY IF EXISTS "Allow admin update reservations" ON public.reservations;
DROP POLICY IF EXISTS "Allow admin delete reservations" ON public.reservations;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.reservations;
DROP POLICY IF EXISTS "Enable read for all users" ON public.reservations;

-- 4. RLS Policies (Targeting 'public' ensures both website form & admin dashboard work seamlessly)

-- Policy 1: Allow public users to submit reservations
CREATE POLICY "Allow public insert reservations"
    ON public.reservations
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Policy 2: Allow admin dashboard to view reservations
CREATE POLICY "Allow public select reservations"
    ON public.reservations
    FOR SELECT
    TO public
    USING (true);

-- Policy 3: Allow admin dashboard to update reservation status
CREATE POLICY "Allow public update reservations"
    ON public.reservations
    FOR UPDATE
    TO public
    USING (true)
    WITH CHECK (true);

-- Policy 4: Allow admin dashboard to delete reservations
CREATE POLICY "Allow public delete reservations"
    ON public.reservations
    FOR DELETE
    TO public
    USING (true);

-- =======================================================
-- EXAMPLE INSERT QUERY (For testing in Supabase SQL Editor)
-- =======================================================
INSERT INTO public.reservations (
    full_name,
    phone,
    reservation_date,
    reservation_time,
    guests,
    seating_preference,
    special_requests
) VALUES (
    'Juan Dela Cruz',
    '+639171234567',
    '2026-08-15',
    '12:00 PM',
    2,
    'Main Dining Hall',
    'Anniversary celebration table near the window'
)
RETURNING *;
