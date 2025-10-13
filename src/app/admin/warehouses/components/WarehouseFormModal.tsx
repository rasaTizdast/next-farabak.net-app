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
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  editing: boolean;
  formName: string;
  setFormName: (v: string) => void;
  formLocation?: string;
  setFormLocation: (v: string) => void;
}) {
  return (
    <ModalBase
      open={open}
      onClose={onClose}
      title={editing ? "ویرایش انبار" : "ایجاد انبار جدید"}
      footer={
        <>
          <ButtonBase onClick={onClose}>انصراف</ButtonBase>
          <ButtonBase variant="primary" onClick={onSubmit}>
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
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-gray-300">مکان</span>
          <InputBase
            value={formLocation}
            onChange={(e) => setFormLocation((e.target as HTMLInputElement).value)}
            placeholder="مکان انبار را وارد کنید"
          />
        </label>
      </div>
    </ModalBase>
  );
}
