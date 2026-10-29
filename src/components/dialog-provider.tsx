"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

// 브라우저 기본 alert / confirm 대신 쓰는 앱 공통 알림·확인 창.
// 사용: const { confirm, alert } = useDialog();
//       if (!(await confirm({ message: "삭제할까요?", confirmLabel: "삭제" }))) return;
//       await alert({ message: "삭제하지 못했어요." });

interface DialogOptions {
  title?: string;
  /** 줄바꿈(\n)을 그대로 보여준다 */
  message: string;
  confirmLabel?: string;
}

interface ConfirmOptions extends DialogOptions {
  cancelLabel?: string;
}

interface DialogApi {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (options: DialogOptions) => Promise<void>;
}

type OpenDialog = (ConfirmOptions & { kind: "confirm" | "alert" }) | null;

const DialogContext = createContext<DialogApi | null>(null);

export function useDialog(): DialogApi {
  const api = useContext(DialogContext);
  if (!api) throw new Error("useDialog는 DialogProvider 안에서만 쓸 수 있어요.");
  return api;
}

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<OpenDialog>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const open = useCallback((next: NonNullable<OpenDialog>) => {
    // 이미 떠 있는 창이 있으면 취소로 닫고 새 창을 띄운다
    resolveRef.current?.(false);
    setDialog(next);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const close = useCallback((result: boolean) => {
    resolveRef.current?.(result);
    resolveRef.current = null;
    setDialog(null);
  }, []);

  const api = useMemo<DialogApi>(
    () => ({
      confirm: (options) => open({ ...options, kind: "confirm" }),
      alert: async (options) => {
        await open({ ...options, kind: "alert" });
      },
    }),
    [open],
  );

  return (
    <DialogContext.Provider value={api}>
      {children}
      {dialog && <DialogView dialog={dialog} onClose={close} />}
    </DialogContext.Provider>
  );
}

function DialogView({ dialog, onClose }: { dialog: NonNullable<OpenDialog>; onClose: (result: boolean) => void }) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const isConfirm = dialog.kind === "confirm";

  useEffect(() => {
    confirmRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      // 바깥(어두운 배경)을 누르면 취소
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose(false);
      }}
    >
      <div
        role={isConfirm ? "alertdialog" : "dialog"}
        aria-modal="true"
        aria-labelledby={dialog.title ? "app-dialog-title" : undefined}
        aria-describedby="app-dialog-message"
        className="w-[min(20rem,100%)] rounded-[15px] bg-surface p-5 shadow-elevation-3"
      >
        {dialog.title && (
          <h2 id="app-dialog-title" className="mb-2 text-base font-extrabold text-on-surface">
            {dialog.title}
          </h2>
        )}
        <p id="app-dialog-message" className="text-sm leading-6 whitespace-pre-line text-[#333]">
          {dialog.message}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          {isConfirm && (
            <button
              type="button"
              onClick={() => onClose(false)}
              className="inline-flex h-9 cursor-pointer items-center rounded-full px-4 text-sm font-bold text-[#333] hover:bg-on-surface/8"
            >
              {dialog.cancelLabel ?? "취소"}
            </button>
          )}
          <button
            ref={confirmRef}
            type="button"
            onClick={() => onClose(true)}
            className="inline-flex h-9 cursor-pointer items-center rounded-full bg-primary px-5 text-sm font-bold text-on-primary hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {dialog.confirmLabel ?? "확인"}
          </button>
        </div>
      </div>
    </div>
  );
}
