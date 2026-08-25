"use client";

import { FormInstance } from "antd";
import { useCallback, useRef } from "react";

import { formatDateToISOString } from "@/lib/validators";

import { useWarrantyStep, type WarrantyItem } from "../WarrantyStepContext";

export function useWarrantyForm(form: FormInstance) {
  const { state, actions, meta } = useWarrantyStep();
  const editingProductRef = useRef<WarrantyItem | null>(null);

  const parseISODate = useCallback((dateString: string | null): Date | null => {
    if (!dateString) return null;
    return new Date(dateString);
  }, []);

  const calculateDuration = useCallback(
    (startDate: Date | null, endDate: Date | null): string | null => {
      if (!startDate || !endDate) return null;

      try {
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return "تاریخ نامعتبر";
        }

        if (startDate >= endDate) return "تاریخ پایان باید پس از تاریخ شروع باشد";

        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const totalMonths = Math.floor(diffDays / 30);

        if (diffDays < 30) {
          return `${diffDays} روز`;
        } else if (totalMonths < 12) {
          return `${totalMonths} ماه`;
        } else {
          const years = Math.floor(totalMonths / 12);
          const remainingMonths = totalMonths % 12;

          if (remainingMonths === 0) {
            return `${years} سال`;
          } else {
            return `${years} سال و ${remainingMonths} ماه`;
          }
        }
      } catch (error) {
        console.error("Error calculating duration:", error);
        return "خطا در محاسبه مدت گارانتی";
      }
    },
    []
  );

  const handleEdit = useCallback(
    (item: WarrantyItem) => {
      editingProductRef.current = item;
      actions.setDatePickerLoading(true);

      const hasWarranty = item.warranty?.hasWarranty !== false;
      let startDate = item.warranty?.startdate;
      let expiryDate = item.warranty?.expirydate;

      if (!startDate || !expiryDate) {
        const today = new Date();
        const start = formatDateToISOString(today);
        const end = formatDateToISOString(
          (() => {
            const oneYearLater = new Date(today);
            oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
            oneYearLater.setDate(today.getDate());
            return oneYearLater;
          })()
        );
        if (start) startDate = start;
        if (end) expiryDate = end;
      }

      form.setFieldsValue({
        hasWarranty,
        startdate: hasWarranty ? parseISODate(startDate) : null,
        expirydate: hasWarranty ? parseISODate(expiryDate) : null,
        warrantycode: item.warranty?.warrantycode || "",
      });

      if (hasWarranty && startDate && expiryDate) {
        const startDateObj = parseISODate(startDate);
        const expiryDateObj = parseISODate(expiryDate);
        const duration = calculateDuration(startDateObj, expiryDateObj);
        actions.setDurationText(duration);
      } else {
        actions.setDurationText(null);
      }

      actions.setEditingProduct(item);
      actions.setModalVisible(true);

      setTimeout(() => {
        actions.setDatePickerLoading(false);
      }, 300);
    },
    [form, actions, parseISODate, calculateDuration]
  );

  const handleSaveWarranty = useCallback(() => {
    form
      .validateFields()
      .then((values) => {
        if (!editingProductRef.current) return;

        const { hasWarranty } = values;
        let startdate = values.startdate;
        let expirydate = values.expirydate;

        if (startdate && typeof startdate === "object") {
          if ("value" in startdate) {
            const formatted = formatDateToISOString(new Date(startdate.value));
            if (formatted) startdate = formatted;
          } else if (startdate instanceof Date) {
            const formatted = formatDateToISOString(startdate);
            if (formatted) startdate = formatted;
          }
        }

        if (expirydate && typeof expirydate === "object") {
          if ("value" in expirydate) {
            const formatted = formatDateToISOString(new Date(expirydate.value));
            if (formatted) expirydate = formatted;
          } else if (expirydate instanceof Date) {
            const formatted = formatDateToISOString(expirydate);
            if (formatted) expirydate = formatted;
          }
        }

        // For branch users, preserve the original start date
        if (meta.isBranch && editingProductRef.current.warranty?.startdate) {
          startdate = editingProductRef.current.warranty.startdate;
        }

        const updatedItems = state.productsWithWarranty.map((item) => {
          if (item.singleItemId === editingProductRef.current?.singleItemId) {
            return {
              ...item,
              warranty: {
                ...item.warranty,
                startdate,
                expirydate,
                warrantycode: editingProductRef.current.warranty?.warrantycode,
                hasWarranty,
              },
            };
          }
          return item;
        });

        actions.setProductsWithWarranty(updatedItems);
        actions.setModalVisible(false);
        actions.resetForm();
      })
      .catch((err) => {
        console.error("Form validation error:", err);
      });
  }, [form, state.productsWithWarranty, actions, meta.isBranch]);

  const handleDateChange = useCallback(() => {
    try {
      const hasWarranty = form.getFieldValue("hasWarranty");
      let startDate = form.getFieldValue("startdate");
      let endDate = form.getFieldValue("expirydate");

      if (startDate && typeof startDate === "object" && "value" in startDate) {
        startDate = new Date(startDate.value);
      }

      if (endDate && typeof endDate === "object" && "value" in endDate) {
        endDate = new Date(endDate.value);
      }

      if (hasWarranty && startDate && endDate) {
        const duration = calculateDuration(startDate, endDate);
        actions.setDurationText(duration);
      } else {
        actions.setDurationText(null);
      }
    } catch (error) {
      console.error("Error in date change:", error);
      actions.setDurationText("خطا در محاسبه مدت گارانتی");
    }
  }, [form, actions, calculateDuration]);

  const handleWarrantyToggle = useCallback(
    (checked: boolean) => {
      if (checked) {
        const today = new Date();
        const oneYearLater = new Date(today);
        oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
        oneYearLater.setDate(today.getDate());

        const startDate =
          meta.isBranch && editingProductRef.current?.warranty?.startdate
            ? parseISODate(editingProductRef.current.warranty.startdate)
            : today;

        form.setFieldsValue({
          startdate: startDate,
          expirydate: oneYearLater,
        });

        const duration = calculateDuration(startDate, oneYearLater);
        actions.setDurationText(duration);
      } else {
        form.setFieldsValue({
          startdate: null,
          expirydate: null,
        });
        actions.setDurationText(null);
      }
    },
    [form, meta.isBranch, actions, parseISODate, calculateDuration]
  );

  return {
    handleEdit,
    handleSaveWarranty,
    handleDateChange,
    handleWarrantyToggle,
    editingProduct: state.editingProduct,
    modalVisible: state.modalVisible,
    setModalVisible: actions.setModalVisible,
    isDatePickerLoading: state.isDatePickerLoading,
    durationText: state.durationText,
    formValues: state.formValues,
    isBranch: meta.isBranch,
  };
}
