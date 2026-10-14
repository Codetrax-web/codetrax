-- =====================================================
-- CODETRAX: tabla y función de métricas (likes y vistas) en Supabase
-- Cómo usarlo: Supabase > SQL Editor > New query > pega TODO esto > Run.
-- =====================================================

-- 1) Tabla: una fila por proyecto/recurso. El título se guarda en minúsculas.
create table if not exists public.metricas (
  tabla  text    not null,                              -- 'Portafolio' o 'Recursos'
  titulo text    not null,
  likes  integer not null default 0 check (likes  >= 0),
  vistas integer not null default 0 check (vistas >= 0),
  primary key (tabla, titulo)
);

-- 2) Seguridad: cualquiera puede LEER, pero nadie puede escribir directamente en la tabla.
alter table public.metricas enable row level security;
drop policy if exists "lectura publica" on public.metricas;
create policy "lectura publica" on public.metricas for select using (true);

-- 3) Única vía de escritura: suma +1 o -1 en el servidor (atómico, sin carreras entre visitantes).
create or replace function public.incrementar_metrica(p_tabla text, p_titulo text, p_campo text, p_delta int)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_tabla not in ('Portafolio','Recursos') then raise exception 'tabla invalida'; end if;
  if p_campo not in ('likes','vistas')        then raise exception 'campo invalido'; end if;
  if p_delta not in (-1, 1)                   then raise exception 'delta invalido'; end if;
  if length(trim(p_titulo)) = 0 or length(p_titulo) > 120 then raise exception 'titulo invalido'; end if;

  insert into public.metricas (tabla, titulo, likes, vistas)
  values (p_tabla, lower(trim(p_titulo)),
          case when p_campo = 'likes'  then greatest(p_delta, 0) else 0 end,
          case when p_campo = 'vistas' then greatest(p_delta, 0) else 0 end)
  on conflict (tabla, titulo) do update set
    likes  = case when p_campo = 'likes'  then greatest(metricas.likes  + p_delta, 0) else metricas.likes  end,
    vistas = case when p_campo = 'vistas' then greatest(metricas.vistas + p_delta, 0) else metricas.vistas end;
end $$;

grant execute on function public.incrementar_metrica(text, text, text, int) to anon;
