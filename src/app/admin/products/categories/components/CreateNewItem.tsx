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
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[1800px]">
        {isLoading ? (
          <div className="animate-pulse p-3 rounded-xl bg-gray-300 shadow-lg w-full h-[50px] max-w-64"></div>
        ) : (
          <button
            className="p-3 rounded-xl bg-blue-300 shadow-lg hover:bg-blue-400 transition-all text-xs md:text-md"
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
