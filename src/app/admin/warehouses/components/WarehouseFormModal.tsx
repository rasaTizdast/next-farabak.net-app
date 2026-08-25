"use client";

import { Button } from "@/components/ui/antd/Button";
import { Input } from "@/components/ui/antd/Input";
import { Modal } from "@/components/ui/antd/Modal";

const EMPTY_WAREHOUSES: Array<{ warehouseid: number; name: string }> = [];

function getNameError(
  formName: string,
  existingWarehouses: Array<{ warehouseid: number; name: string }>,
  editing: boolean,
  editingWarehouseId?: number
): string {
  if (!formName.trim()) return "";
  const trimmedName = formName.trim();
  const existingWarehouse = existingWarehouses.find(
    (wh) => wh.name.toLowerCase() === trimmedName.toLowerCase()
  );
  if (!existingWarehouse) return "";
  if (editing && editingWarehouseId && existingWarehouse.warehouseid === editingWarehouseId)
    return "";
  return "نام انبار تکراری است. لطفاً نام دیگری انتخاب کنید.";
}

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
  const nameError = getNameError(formName, existingWarehouses, editing, editingWarehouseId);

  const isFormValid = formName.trim() && formLocation?.trim() && !nameError;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={editing ? "ویرایش انبار" : "ایجاد انبار جدید"}
      width={600}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            انصراف
          </Button>
          <Button variant="primary" onClick={onSubmit} disabled={!isFormValid}>
            {editing ? "ذخیره" : "ایجاد"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-gray-300">نام انبار</span>
          <Input
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="نام انبار را وارد کنید"
            required
            status={nameError ? "error" : undefined}
          />
          {nameError && <div className="text-sm text-red-400">{nameError}</div>}
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-gray-300">مکان</span>
          <Input
            value={formLocation}
            onChange={(e) => setFormLocation(e.target.value)}
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
    </Modal>
  );
}
