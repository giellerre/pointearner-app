-- Pianificazione notturna della pulizia (richiede l'estensione pg_cron, disponibile su Supabase)
create extension if not exists pg_cron;

select cron.unschedule(jobid) from cron.job where jobname = 'pointearner_purge_expired_data';
select cron.schedule(
  'pointearner_purge_expired_data',
  '15 3 * * *',
  $$select public.purge_expired_data()$$
);
