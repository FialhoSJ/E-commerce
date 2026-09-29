'use client';

import { useEffect, useId, useRef } from 'react';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmDialog({ open, title, description, confirmLabel, busy = false, onCancel, onConfirm }: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const cancelHandler = useRef(onCancel);
  const busyState = useRef(busy);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => { cancelHandler.current = onCancel; }, [onCancel]);
  useEffect(() => { busyState.current = busy; }, [busy]);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    cancelRef.current?.focus();
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busyState.current) cancelHandler.current();
    };
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
      previouslyFocused?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-[#242622]/55 px-5 py-8 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onCancel(); }}>
      <section role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId} onKeyDown={(event) => {
        if (event.key !== 'Tab') return;
        const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
        if (!buttons.length) return;
        if (event.shiftKey && document.activeElement === buttons[0]) { event.preventDefault(); buttons[buttons.length - 1].focus(); }
        else if (!event.shiftKey && document.activeElement === buttons[buttons.length - 1]) { event.preventDefault(); buttons[0].focus(); }
      }} className="w-full max-w-sm rounded-[1.5rem] border border-[#d9d2c5] bg-[#f8f6f0] p-6 text-[#242622] shadow-[0_24px_70px_-30px_rgba(0,0,0,.55)] sm:p-7">
        <div className="grid h-11 w-11 place-items-center rounded-full bg-[#ef6b3b]/10 text-xl text-[#c94924]" aria-hidden="true">↗</div>
        <h2 id={titleId} className="mt-5 text-2xl">{title}</h2>
        <p id={descriptionId} className="mt-2 text-sm leading-6 text-[#777568]">{description}</p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button ref={cancelRef} type="button" disabled={busy} onClick={onCancel} className="rounded-full border border-[#d9d2c5] px-5 py-3 text-sm font-semibold text-[#55564f] transition hover:bg-[#e8e1d4] disabled:cursor-not-allowed disabled:opacity-60">Continuar conectado</button>
          <button type="button" disabled={busy} onClick={onConfirm} className="rounded-full bg-[#ef6b3b] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#c94924] disabled:cursor-wait disabled:opacity-70">{busy ? 'Saindo...' : confirmLabel}</button>
        </div>
      </section>
    </div>
  );
}
