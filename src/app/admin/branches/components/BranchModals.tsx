"use client";

import React from "react";

import CreateBranchModal from "./CreateBranchModal";
import EditBranchModal from "./EditBranchModal";
import { Branch, User } from "./types";

interface BranchModalsProps {
  createVisible: boolean;
  editVisible: boolean;
  currentBranch: Branch | null;
  form: any;
  editForm: any;
  users: User[];
  currentUserId?: number;
  onCreate: (values: any) => void;
  onUpdate: (values: any) => void;
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
