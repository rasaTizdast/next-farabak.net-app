"use client";

import { ButtonBase, InputBase, ModalBase } from "./ui";

export default function WarehouseFormModal({
  open,
  onClose,
  onSubmit,
  editing,
  formName,
  setFormName,
  formLocation,
  setFormLocation,
  disableSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  editing: boolean;
  formName: string;
  setFormName: (v: string) => void;
  formLocation?: string;
  setFormLocation: (v: string) => void;
  disableSubmit?: boolean;
}) {
  return (
    <ModalBase
      open={open}
      onClose={onClose}
      title={editing ? "ویرایش انبار" : "ایجاد انبار جدید"}
      footer={
        <>
          <ButtonBase onClick={onClose}>انصراف</ButtonBase>
          <ButtonBase variant="primary" onClick={onSubmit} disabled={!!disableSubmit}>
            {editing ? "ذخیره" : "ایجاد"}
          </ButtonBase>
        </>
      }
    >
      <div className="space-y-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-gray-300">نام انبار</span>
          <InputBase
            value={formName}
            onChange={(e) => setFormName((e.target as HTMLInputElement).value)}
            placeholder="نام انبار را وارد کنید"
            required
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-gray-300">مکان</span>
          <InputBase
            value={formLocation}
            onChange={(e) => setFormLocation((e.target as HTMLInputElement).value)}
            placeholder="مکان انبار را وارد کنید"
            required
          />
        </label>
        {disableSubmit && (
          <div className="rounded border border-amber-600 bg-amber-900/30 p-2 text-sm text-amber-200">
            لطفاً نام و مکان انبار را وارد کنید
          </div>
        )}
      </div>
    </ModalBase>
  );
}
