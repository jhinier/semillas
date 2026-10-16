import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { actualizarSendaAdmin, obtenerSendaAdmin } from "../admin.api";
import { SendaSchema, type SendaFormData } from "@/shared/schemas/senda.schema";

export function useSendaEdit(sendaId: string) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "senda",sendaId],
    queryFn: () => obtenerSendaAdmin(sendaId),
  });

  const [activo, setActivo] = useState(false);
  const [nombreIcono, setNombreIcono] = useState("");

  const form = useForm<SendaFormData>({
    resolver: zodResolver(SendaSchema),
    defaultValues: {
      codigo: "",
      nombre: "",
      descripcion: "",
      color: "#3D8BD4",
      orden: 1,
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion || "",
        color: data.color_hex,
        orden: data.orden,
      });
      setActivo(data.activo);
      setNombreIcono(data.nombre_icono || "");
    }
  }, [data, form]);

  const mutation = useMutation({
    mutationFn: (datos: SendaFormData & { activo: boolean; nombre_icono?: string }) =>
      actualizarSendaAdmin(sendaId, {
        codigo: datos.codigo,
        nombre: datos.nombre,
        descripcion: datos.descripcion || undefined,
        color_hex: datos.color,
        nombre_icono: datos.nombre_icono || undefined,
        orden: datos.orden,
        activo: datos.activo,
      }),
    onSuccess: () => {
      toast.success("Senda actualizada exitosamente");
      queryClient.invalidateQueries({ queryKey: ["admin", "sendas"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "senda",sendaId] });
      navigate({ to: "/admin/sendas" });
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(error.message || "Error al actualizar la saura");
      if (error.codigo) {
        form.setError("codigo", { message: "Posiblemente este código ya existe" });
      }
      if (error.orden) {
        form.setError("orden", { message: "Este orden ya podría estar en uso" });
      }
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate({
      ...values,
      activo,
      nombre_icono: nombreIcono || undefined,
    });
  });

  return {
    form,
    onSubmit,
    mutation,
    isLoading,
    isError,
    isPending: mutation.isPending,
    activo,
    setActivo,
    nombreIcono,
    setNombreIcono,
  };
}
