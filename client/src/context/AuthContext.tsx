// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";
import { apiCLient, GET_USER_ROUTE } from "@/service/app";

type User = {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: number;
  [ k: string ]: any;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: ( email: string, password: string ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>( undefined );

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ( { children } ) => {
  const [ user, setUser ] = useState<User | null>( null );
  const [ loading, setLoading ] = useState<boolean>( true );

  // on mount, try to fetch /me (if cookies present this will succeed)
  useEffect( () => {
    ( async () => {
      try {
        await refreshUser();
      } catch ( err ) {
        setUser( null );
      } finally {
        setLoading( false );
      }
    } )();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [] );

  const refreshUser = async () => {
    setLoading( true );
    try {
      const res = await apiCLient.get( GET_USER_ROUTE );
      // backend uses ApiResponse(status, data, message) => res.data.data = user
      const maybePayload = res.data.data ?? res;
      const gotUser = maybePayload?.data ?? maybePayload ?? null;
      setUser( gotUser );
    } catch ( err ) {
      setUser( null );
      console.log( err );
    } finally {
      setLoading( false );
    }
  };

  const login = async ( email: string, password: string ) => {
    setLoading( true );
    try {
      // backend sets httpOnly cookies on success and returns user object in response
      const res = await api.post( "/api/users/login", { email, password } );
      // res may contain { data: { user } } or { user }
      const payload = res.data ?? res;
      const gotUser = payload?.data?.user ?? payload?.data ?? payload?.user ?? null;

      // After login, cookies are set — fetch /me to ensure auth state
      await refreshUser();

      if ( !gotUser && !user ) {
        // optional: if server doesn't return user, refreshUser above will populate
      }
    } finally {
      setLoading( false );
    }
  };

  const logout = async () => {
    setLoading( true );
    try {
      await api.post( "/api/users/logout" ); // backend clears cookies
      setUser( null );
    } catch ( err ) {
      // still clear client state
      setUser( null );
      throw err;
    } finally {
      setLoading( false );
    }
  };

  return (
    <AuthContext.Provider value={ { user, loading, login, logout, refreshUser } }>
      { children }
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const c = useContext( AuthContext );
  if ( !c ) throw new Error( "useAuth must be used inside AuthProvider" );
  return c;
};
