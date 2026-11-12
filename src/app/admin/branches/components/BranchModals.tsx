"use client";

import { FormInstance } from "antd";
import React from "react";
import { z } from "zod";

import { createBranchSchema, updateBranchSchema } from "@/lib/validation";

import CreateBranchModal from "./CreateBranchModal";
import EditBranchModal from "./EditBranchModal";
import { Branch, User } from "./types";

type CreateBranchInput = z.infer<typeof createBranchSchema>;
type UpdateBranchInput = z.infer<typeof updateBranchSchema>;

interface BranchModalsProps {
  createVisible: boolean;
  editVisible: boolean;
  currentBranch: Branch | null;
  form: FormInstance<CreateBranchInput>;
  editForm: FormInstance<UpdateBranchInput>;
  users: User[];
  currentUserId?: number;
  onCreate: (values: CreateBranchInput) => void;
  onUpdate: (values: UpdateBranchInput) => void;
  onCloseCreate: () => void;
  onCloseEdit: () => void;
}

const BranchModals: React.FC<BranchModalsProps> = ({
  createVisible,
  editVisible,
  currentBranch,
  form,
  editForm,
  users,
  currentUserId,
  onCreate,
  onUpdate,
  onCloseCreate,
  onCloseEdit,
}) => {
  return (
    <>
      <CreateBranchModal
        visible={createVisible}
        onClose={onCloseCreate}
        onFinish={onCreate}
        form={form}
        users={users}
        currentUserId={currentUserId}
      />
      {currentBranch && (
        <EditBranchModal
          visible={editVisible}
          onClose={onCloseEdit}
          onFinish={onUpdate}
          form={editForm}
          branch={currentBranch}
          users={users}
        />
      )}
    </>
  );
};

export default BranchModals;
