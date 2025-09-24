import { useState } from "react";

import CreateNewItemModal from "./CreateNewItemModal";
import { Category } from "../types/types";

type Props = {
  refetchCategories: () => void;
  isLoading: boolean;
  categories: Category[];
};

const CreateNewItem = ({ refetchCategories, isLoading, categories }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModalHandler = () => setIsModalOpen(true);
  const closeModalHandler = () => setIsModalOpen(false);

  return (
    <div className="flex w-full justify-center">
      <div className="w-full max-w-[1800px]">
        {isLoading ? (
          <div className="h-[50px] w-full max-w-64 animate-pulse rounded-xl bg-gray-300 p-3 shadow-lg"></div>
        ) : (
          <button
            className="text-md rounded-xl bg-blue-300 p-3 shadow-lg transition-all hover:bg-blue-400"
            onClick={openModalHandler}
          >
            ساخت دسته‌بندی یا زیردسته‌بندی جدید
          </button>
        )}
        <CreateNewItemModal
          isOpen={isModalOpen}
          onClose={closeModalHandler}
          refetchCategories={refetchCategories}
          categories={categories}
        />
      </div>
    </div>
  );
};

export default CreateNewItem;
