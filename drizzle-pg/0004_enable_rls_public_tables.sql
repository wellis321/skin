-- Enable RLS on all public tables so Supabase PostgREST/API cannot access them.
-- The app uses Drizzle with the postgres role (bypasses RLS); only direct API access is restricted.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.one_to_one_booking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_interest ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_interest ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_class ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_product ENABLE ROW LEVEL SECURITY;
