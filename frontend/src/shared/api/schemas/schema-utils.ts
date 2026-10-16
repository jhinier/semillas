import { z } from "zod";

export const idSchema = z.string().uuid();
export const fechaIsoSchema = z.string();
export const nullable = <T extends z.ZodType>(schema: T) => schema.nullable();
