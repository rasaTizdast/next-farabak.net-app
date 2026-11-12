import { FormInstance, Modal } from "antd";
import React from "react";
import { z } from "zod";

import { adminColors } from "@/constants/adminColors";
import { createBranchSchema } from "@/lib/validation";

import BranchForm from "./BranchForm";
import { User } from "./types";

type CreateBranchInput = z.infer<typeof createBranchSchema>;

interface CreateBranchModalProps {
  visible: boolean;
  onClose: () => void;
  onFinish: (values: CreateBranchInput) => void;
  form: FormInstance<CreateBranchInput>;
  users: User[];
  currentUserId?: number;
}

const CreateBranchModal: React.FC<CreateBranchModalProps> = ({
  visible,
  onClose,
  onFinish,
  form,
  users,
  currentUserId,
}) => {
  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  // Filter out the current user from the users list
  const filteredUsers = currentUserId
    ? users.filter((user) => user.UserID !== currentUserId)
    : users;

  return (
    <Modal
      title="ایجاد شعبه جدید"
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
        users={filteredUsers}
        isEdit={false}
        submitButtonText="ایجاد شعبه"
      />
    </Modal>
  );
};

export default CreateBranchModal;
