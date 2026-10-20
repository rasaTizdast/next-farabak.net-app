"use client";

import { BlogForm } from "@/components/blog/BlogForm";

type BlogEditModalProps = {
  id: number | null;
  onClose: () => void;
};

const BlogEditModal: React.FC<BlogEditModalProps> = ({ id, onClose }) => {
  return <BlogForm key={id} mode="edit" id={id} onClose={onClose} />;
};

export default BlogEditModal;
