"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";

import type { AppDispatch } from "@/app/store/store";
import {
  setCredentials,
  setLoading,
  setError,
} from "@/app/store/authSlice";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface AuthInitializerProps {
  children: React.ReactNode;
}

export default function AuthInitializer({
  children,
}: AuthInitializerProps) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get a new access token using the HttpOnly refresh-token cookie
        const refreshResponse = await fetch(
          `${API_URL}/auth/refresh`,
          {
            method: "POST",
            credentials: "include",
          }
        );

        if (!refreshResponse.ok) {
          dispatch(setLoading(false));
          return;
        }

        const refreshData = await refreshResponse.json();
        const accessToken = refreshData.access_token;

        if (!accessToken) {
          dispatch(setLoading(false));
          return;
        }

        // Get the authenticated user's information
        const meResponse = await fetch(
          `${API_URL}/auth/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include",
          }
        );

        if (!meResponse.ok) {
          dispatch(setError("Failed to retrieve user information"));
          dispatch(setLoading(false));
          return;
        }

        const user = await meResponse.json();

        // Store the authenticated user and access token in Redux
        dispatch(
          setCredentials({
            user,
            accessToken,
          })
        );
      } catch (error) {
        console.error(
          "Authentication initialization failed:",
          error
        );

        dispatch(
          setError("Unable to restore authentication session")
        );

        dispatch(setLoading(false));
      }
    };

    initializeAuth();
  }, [dispatch]);

  return <>{children}</>;
}