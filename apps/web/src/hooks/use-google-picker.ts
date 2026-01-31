"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const SCOPES = "https://www.googleapis.com/auth/drive.readonly";

interface GooglePickerFile {
  id: string;
  name: string;
  mimeType: string;
  url: string;
  iconUrl: string;
  sizeBytes?: number;
}

interface UseGooglePickerOptions {
  onFilesSelected?: (files: GooglePickerFile[], accessToken: string) => void;
  onError?: (error: Error) => void;
  multiSelect?: boolean;
}

interface GooglePickerResponse {
  action: string;
  docs?: Array<{
    id: string;
    name: string;
    mimeType: string;
    url: string;
    iconUrl: string;
    sizeBytes?: number;
  }>;
}

type TokenClient = {
  requestAccessToken: (options?: { prompt?: string }) => void;
};

type TokenResponse = {
  access_token?: string;
  error?: string;
};

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
    if (existing) {
      // Script tag exists but may not have finished loading yet
      if (existing.getAttribute("data-loaded") === "true") {
        resolve();
        return;
      }
      const onLoad = () => {
        existing.removeEventListener("load", onLoad);
        existing.removeEventListener("error", onError);
        resolve();
      };
      const onError = () => {
        existing.removeEventListener("load", onLoad);
        existing.removeEventListener("error", onError);
        reject(new Error(`Failed to load ${src}`));
      };
      existing.addEventListener("load", onLoad);
      existing.addEventListener("error", onError);
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      script.setAttribute("data-loaded", "true");
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

function waitForGlobal<T>(getter: () => T | null, name: string, timeout = 5000): Promise<T> {
  return new Promise((resolve, reject) => {
    const value = getter();
    if (value) {
      resolve(value);
      return;
    }
    const start = Date.now();
    const interval = setInterval(() => {
      const value = getter();
      if (value) {
        clearInterval(interval);
        resolve(value);
      } else if (Date.now() - start > timeout) {
        clearInterval(interval);
        reject(new Error(`${name} not loaded after ${timeout}ms`));
      }
    }, 50);
  });
}

type Gapi = {
  load: (api: string, callback: () => void) => void;
};

function getGapi(): Gapi | null {
  return (window as unknown as { gapi?: Gapi }).gapi ?? null;
}

function getGooglePicker(): unknown | null {
  const google = (window as unknown as { google?: { picker?: unknown; accounts?: unknown } }).google;
  return google?.picker ?? null;
}

function getGoogleAccounts(): unknown | null {
  const google = (window as unknown as { google?: { picker?: unknown; accounts?: unknown } }).google;
  return google?.accounts ?? null;
}

export function useGooglePicker(options: UseGooglePickerOptions = {}) {
  const { onFilesSelected, onError, multiSelect = true } = options;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const tokenClientRef = useRef<TokenClient | null>(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_API_KEY) {
      console.warn("Google Drive credentials not configured");
      return;
    }

    const initializeGoogleApis = async () => {
      try {
        await Promise.all([
          loadScript("https://apis.google.com/js/api.js"),
          loadScript("https://accounts.google.com/gsi/client"),
        ]);

        const gapi = await waitForGlobal(getGapi, "GAPI");

        await new Promise<void>((resolve) => {
          gapi.load("picker", resolve);
        });

        const accounts = getGoogleAccounts() as {
          oauth2: {
            initTokenClient: (config: {
              client_id: string;
              scope: string;
              callback: (response: TokenResponse) => void;
            }) => TokenClient;
          };
        } | null;

        if (!accounts?.oauth2) throw new Error("Google accounts not loaded");

        tokenClientRef.current = accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID!,
          scope: SCOPES,
          callback: () => {},
        });

        setIsReady(true);
      } catch (error) {
        console.error("Error initializing Google APIs:", error);
        onError?.(error instanceof Error ? error : new Error("Failed to load Google APIs"));
      }
    };

    initializeGoogleApis();
  }, [onError]);

  const showPicker = useCallback((token: string) => {
    const picker = getGooglePicker() as {
      PickerBuilder: new () => {
        setOAuthToken: (token: string) => unknown;
        setDeveloperKey: (key: string) => unknown;
        addView: (view: unknown) => unknown;
        setCallback: (callback: (data: GooglePickerResponse) => void) => unknown;
        setTitle: (title: string) => unknown;
        setLocale: (locale: string) => unknown;
        enableFeature: (feature: string) => unknown;
        build: () => { setVisible: (visible: boolean) => void };
      };
      DocsView: new () => {
        setIncludeFolders: (include: boolean) => unknown;
        setMimeTypes: (mimeTypes: string) => unknown;
      };
      Feature: { MULTISELECT_ENABLED: string };
      Action: { PICKED: string; CANCEL: string };
    } | null;

    if (!picker) {
      onError?.(new Error("Google Picker not available"));
      setIsLoading(false);
      return;
    }

    const docsView = new picker.DocsView();
    docsView.setIncludeFolders(true);
    docsView.setMimeTypes(
      [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
        "image/bmp",
        "image/tiff",
        "video/mp4",
        "video/quicktime",
        "video/webm",
        "video/mpeg",
        "video/x-msvideo",
        "audio/mpeg",
        "audio/wav",
        "audio/ogg",
        "audio/webm",
        "audio/mp4",
        "application/pdf",
        "application/vnd.google-apps.document",
        "application/vnd.google-apps.spreadsheet",
        "application/vnd.google-apps.presentation",
      ].join(",")
    );

    const builder = new picker.PickerBuilder();
    builder.setOAuthToken(token);
    builder.setDeveloperKey(GOOGLE_API_KEY!);
    builder.addView(docsView);
    builder.setCallback((data: GooglePickerResponse) => {
      if (data.action === picker.Action.PICKED && data.docs) {
        const files: GooglePickerFile[] = data.docs.map((doc) => ({
          id: doc.id,
          name: doc.name,
          mimeType: doc.mimeType,
          url: doc.url,
          iconUrl: doc.iconUrl,
          sizeBytes: doc.sizeBytes,
        }));
        
        onFilesSelected?.(files, token);
      }
      setIsLoading(false);
    });
    builder.setTitle("Selecionar arquivos do Google Drive");
    builder.setLocale("pt-BR");

    if (multiSelect) {
      builder.enableFeature(picker.Feature.MULTISELECT_ENABLED);
    }

    const pickerInstance = builder.build();
    pickerInstance.setVisible(true);
  }, [multiSelect, onFilesSelected, onError]);

  const openPicker = useCallback(() => {
    if (!isReady) {
      onError?.(new Error("Google Picker not ready"));
      return;
    }

    setIsLoading(true);

    const accounts = getGoogleAccounts() as {
      oauth2: {
        initTokenClient: (config: {
          client_id: string;
          scope: string;
          callback: (response: TokenResponse) => void;
        }) => TokenClient;
      };
    } | null;

    if (!accounts?.oauth2) {
      onError?.(new Error("Google accounts not available"));
      setIsLoading(false);
      return;
    }

    tokenClientRef.current = accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID!,
      scope: SCOPES,
      callback: (response: TokenResponse) => {
        if (response.error) {
          setIsLoading(false);
          onError?.(new Error(response.error));
          return;
        }

        if (response.access_token) {
          showPicker(response.access_token);
        }
      },
    });

    tokenClientRef.current.requestAccessToken({ prompt: "" });
  }, [isReady, onError, showPicker]);

  return {
    openPicker,
    isLoading,
    isReady,
    isConfigured: Boolean(GOOGLE_CLIENT_ID && GOOGLE_API_KEY),
  };
}
