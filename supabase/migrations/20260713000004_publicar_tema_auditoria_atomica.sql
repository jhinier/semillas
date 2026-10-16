create or replace function public.publicar_tema_con_auditoria(
  p_tema_id uuid,
  p_actor_id uuid,
  p_version_esperada integer
)
returns setof public.tema
language plpgsql
security definer
set search_path = public
as $$
declare
  v_antes jsonb;
  v_despues jsonb;
begin
  select to_jsonb(t) into v_antes
  from public.tema t
  where t.id = p_tema_id
    and t.estado = 'aprobado'
    and t.version_contenido = p_version_esperada
  for update;

  if v_antes is null then
    return;
  end if;

  update public.tema
  set estado = 'publicado',
      version_contenido = p_version_esperada + 1,
      publicado_por = p_actor_id,
      publicado_en = now(),
      actualizado_en = now()
  where id = p_tema_id;

  select to_jsonb(t) into v_despues
  from public.tema t
  where t.id = p_tema_id;

  insert into public.registro_auditoria (
    actor_usuario_id, accion, tipo_entidad, entidad_id, datos_antes, datos_despues
  ) values (
    p_actor_id, 'publicar', 'tema', p_tema_id, v_antes, v_despues
  );

  return query select * from public.tema where id = p_tema_id;
end;
$$;

revoke all on function public.publicar_tema_con_auditoria(uuid, uuid, integer) from public;
grant execute on function public.publicar_tema_con_auditoria(uuid, uuid, integer) to service_role;
