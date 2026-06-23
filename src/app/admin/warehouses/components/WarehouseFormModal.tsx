"use client";

import { useState, useEffect } from "react";

import { ButtonBase, InputBase, ModalBase } from "./ui";

const EMPTY_WAREHOUSES: Array<{ warehouseid: number; name: string }> = [];

export default function WarehouseFormModal({
  open,
  onClose,
  onSubmit,
  editing,
  formName,
  setFormName,
  formLocation,
  setFormLocation,
  existingWarehouses = EMPTY_WAREHOUSES,
  editingWarehouseId,
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
  existingWarehouses?: Array<{ warehouseid: number; name: string }>;
  editingWarehouseId?: number;
}) {
  const [nameError, setNameError] = useState<string>("");

  // Check for duplicate names
  useEffect(() => {
    if (formName.trim()) {
      const trimmedName = formName.trim();
      const existingWarehouse = existingWarehouses.find(
        (wh) => wh.name.toLowerCase() === trimmedName.toLowerCase()
      );

      if (existingWarehouse) {
        // If editing, only show error if it's a different warehouse
        if (editing && editingWarehouseId && existingWarehouse.warehouseid === editingWarehouseId) {
          setNameError("");
        } else {
          setNameError("نام انبار تکراری است. لطفاً نام دیگری انتخاب کنید.");
        }
      } else {
        setNameError("");
      }
    } else {
      setNameError("");
    }
  }, [formName, existingWarehouses, editing, editingWarehouseId]);

  const isFormValid = formName.trim() && formLocation?.trim() && !nameError;

  return (
    <ModalBase
      open={open}
      onClose={onClose}
      title={editing ? "ویرایش انبار" : "ایجاد انبار جدید"}
      footer={
        <>
          <ButtonBase onClick={onClose}>انصراف</ButtonBase>
          <ButtonBase variant="primary" onClick={onSubmit} disabled={!isFormValid}>
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
            className={nameError ? "border-red-500 focus:border-red-500" : ""}
          />
          {nameError && <div className="text-sm text-red-400">{nameError}</div>}
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
        {!isFormValid && (
          <div className="rounded border border-amber-600 bg-amber-900/30 p-2 text-sm text-amber-200">
            {nameError ? nameError : "لطفاً نام و مکان انبار را وارد کنید"}
          </div>
        )}
      </div>
    </ModalBase>
  );
}
