create index if not exists quantum_time_documents_supersedes_idx
  on public.quantum_time_documents (supersedes)
  where supersedes is not null;

drop policy if exists "no direct client access to quantum time documents" on public.quantum_time_documents;
create policy "no direct client access to quantum time documents"
on public.quantum_time_documents
for all
to anon, authenticated
using (false)
with check (false);
