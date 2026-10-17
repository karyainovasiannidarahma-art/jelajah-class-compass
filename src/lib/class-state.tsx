import { createContext, useContext } from "react";
import type { ClassState } from "@/lib/user";

export const ClassCtx = createContext<ClassState | null>(null);
export const useClass = () => useContext(ClassCtx);
