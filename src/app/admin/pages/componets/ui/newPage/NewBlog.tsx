"use client";

import { BlogForm } from "@/components/blog/BlogForm";

const NewBlog: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return <BlogForm mode="create" onClose={onClose} />;
};

export default NewBlog;
