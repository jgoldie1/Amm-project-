do $$
declare
  t text;
  tables text[] := array[
    'game_reward_reserve_ledger','holo_ad_settlements','internal_chain_blocks','money_postings',
    'tryamm_access_codes','tryamm_founder_priority_invites','university_accommodations','university_alumni',
    'university_assignments','university_attendance','university_credentials','university_enrollments',
    'university_equipment','university_exam_attempts','university_exams','university_faculty',
    'university_guardians','university_integrity_cases','university_lab_reservations',
    'university_opportunity_applications','university_portfolio_items','university_submissions',
    'university_support_sessions','university_transcript_entries'
  ];
begin
  foreach t in array tables loop
    execute format('drop policy if exists %I on public.%I', t || '_client_deny', t);
    execute format('create policy %I on public.%I as restrictive for all to anon, authenticated using (false) with check (false)', t || '_client_deny', t);
  end loop;
end $$;
