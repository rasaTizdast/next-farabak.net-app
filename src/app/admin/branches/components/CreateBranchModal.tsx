import React from "react";
import { Modal } from "antd";
import BranchForm from "./BranchForm";
import { User } from "./types";

interface CreateBranchModalProps {
  visible: boolean;
  onClose: () => void;
  onFinish: (values: any) => void;
  form: any;
  users: User[];
}

const CreateBranchModal: React.FC<CreateBranchModalProps> = ({
  visible,
  onClose,
  onFinish,
  form,
  users,
}) => {
  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="ایجاد شعبه جدید"
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
        users={users}
        isEdit={false}
        submitButtonText="ایجاد شعبه"
      />
    </Modal>
  );
};

export default CreateBranchModal;
