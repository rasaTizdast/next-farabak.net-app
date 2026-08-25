"use client";

import { FormInstance, Modal } from "antd";
import React, { useEffect } from "react";
import { z } from "zod";

import { adminColors } from "@/constants/adminColors";
import { updateBranchSchema } from "@/lib/validation";

import BranchForm from "./BranchForm";
import { Branch, User } from "./types";

type UpdateBranchInput = z.infer<typeof updateBranchSchema>;

interface EditBranchModalProps {
  visible: boolean;
  onClose: () => void;
  onFinish: (values: UpdateBranchInput) => void;
  form: FormInstance<UpdateBranchInput>;
  branch: Branch;
  users: User[];
}

const EditBranchModal: React.FC<EditBranchModalProps> = ({
  visible,
  onClose,
  onFinish,
  form,
  branch,
  users,
}) => {
  useEffect(() => {
    if (branch && visible) {
      form.setFieldsValue({
        name: branch.name,
        location: branch.location,
      });
    }
  }, [branch, visible, form]);

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="ویرایش شعبه"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      className="rtl-modal dark-modal"
      styles={{
        header: {
          background: adminColors.panel,
          color: adminColors.textBright,
          borderBottom: `1px solid ${adminColors.border}`,
        },
        body: { background: adminColors.panel, padding: "20px" },
        mask: { background: "rgba(0, 0, 0, 0.7)" },
        content: {
          background: adminColors.panel,
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.5)",
        },
      }}
    >
      <BranchForm
        form={form}
        onFinish={onFinish}
        onCancel={handleCancel}
        isEdit={true}
        submitButtonText="بروزرسانی شعبه"
        users={users}
      />
    </Modal>
  );
};

export default EditBranchModal;
