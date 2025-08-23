import { Modal } from "antd";
import React, { useEffect } from "react";

import BranchForm from "./BranchForm";
import { Branch, User } from "./types";

interface EditBranchModalProps {
  visible: boolean;
  onClose: () => void;
  onFinish: (values: any) => void;
  form: any;
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
          background: "#1f2937",
          color: "#f3f4f6",
          borderBottom: "1px solid #374151",
        },
        body: { background: "#1f2937", padding: "20px" },
        mask: { background: "rgba(0, 0, 0, 0.7)" },
        content: {
          background: "#1f2937",
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
