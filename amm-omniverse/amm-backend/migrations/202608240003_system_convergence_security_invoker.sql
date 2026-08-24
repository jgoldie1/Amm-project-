-- Applied to TRYAMM Supabase as migration system_convergence_summary_security_invoker.
-- Preserve convergence summary behavior while ensuring the view uses caller permissions.

alter view public.system_convergence_summary set (security_invoker = true);
