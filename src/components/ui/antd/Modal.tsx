"use client";
import { Modal as AntModal, ModalProps } from "antd";

export function Modal(props: ModalProps) {
  return <AntModal centered destroyOnHidden footer={null} {...props} />;
}
