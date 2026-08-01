-- =======================================================
-- PHASE 1: SUPABASE DATABASE SCHEMA & RLS POLICIES
-- Project: 1919 Grand Cafe Reservation System
-- =======================================================

-- 1. Create reservations table
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time TEXT NOT NULL,
    guests INTEGER NOT NULL DEFAULT 1,
    seating_preference TEXT,
    special_requests TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Constraint for status validation
ALTER TABLE public.reservations 
    ADD CONSTRAINT check_status 
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'));

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies

-- Policy 1: Allow public (anonymous + authenticated) users to submit reservations
CREATE POLICY "Allow public insert reservations"
    ON public.reservations
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Policy 2: Allow authenticated admins to view all reservations
CREATE POLICY "Allow admin select reservations"
    ON public.reservations
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy 3: Allow authenticated admins to update reservation status/details
CREATE POLICY "Allow admin update reservations"
    ON public.reservations
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy 4: Allow authenticated admins to delete reservations
CREATE POLICY "Allow admin delete reservations"
    ON public.reservations
    FOR DELETE
    TO authenticated
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
