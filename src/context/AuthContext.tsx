import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { derivarClave } from "../services/encryption.service";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  claveMaestra: string | null;
  signUp: (email: string, password: string) => Promise<{ ok: boolean; mensaje: string }>;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; mensaje: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [claveMaestra, setClaveMaestra] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('🟢 onAuthStateChange disparado, evento:', _event);
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });

      if (error) {
        if (error.message.includes("already registered")) {
          return { ok: false, mensaje: "Este correo ya está registrado" };
        }
        return { ok: false, mensaje: error.message };
      }

      return { ok: true, mensaje: "Revisa tu correo para confirmar tu cuenta" };
    } catch (error) {
      return { ok: false, mensaje: "Error al crear la cuenta" };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          return {
            ok: false,
            mensaje: "Debes confirmar tu correo antes de ingresar",
          };
        }
        if (error.message.includes("Invalid login credentials")) {
          return { ok: false, mensaje: "Correo o contraseña incorrectos" };
        }
        return { ok: false, mensaje: error.message };
      }

      if (data.user) {
        const clave = derivarClave(password, data.user.id);
        setClaveMaestra(clave);
      }

      return { ok: true, mensaje: "Bienvenido" };

    } catch (error) {
      return { ok: false, mensaje: "Error al iniciar sesión" };
    }
  };

  const signOut = async () => {
    setClaveMaestra(null);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ session, user, isLoading, claveMaestra, signUp, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};
