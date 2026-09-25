"use client";
import { App } from "antd";
import { useCallback, useEffect, useRef } from "react";

export function useConfirm() {
  const { modal } = App.useApp();
  const pending = useRef(new Set<() => void>());
  useEffect(() => {
    const dialogs = pending.current;
    return () => {
      for (const cancel of dialogs) cancel();
    };
  }, []);
  return useCallback(
    (
      title: string,
      content: string,
      okText = "Confirm",
      cancelText = "Cancel",
    ) =>
      new Promise<boolean>((resolve) => {
        const finish = (accepted: boolean) => {
          pending.current.delete(cancel);
          resolve(accepted);
        };
        const dialog = modal.confirm({
          title,
          content,
          okText,
          cancelText,
          okButtonProps: { danger: true },
          autoFocusButton: "cancel",
          onOk: () => finish(true),
          onCancel: () => finish(false),
        });
        const cancel = () => {
          dialog.destroy();
          finish(false);
        };
        pending.current.add(cancel);
      }),
    [modal],
  );
}
