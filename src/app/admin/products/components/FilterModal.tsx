type Props = {
  applyFilters: () => void;
  setShowFilterModal: (arg0: boolean) => void;
};

const FilterModal = ({ applyFilters, setShowFilterModal }: Props) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-[300px]">
        <p className="text-center text-lg">اعمال فیلتر</p>
        <div className="flex justify-between mt-4">
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            اعمال
          </button>
          <button
            onClick={() => setShowFilterModal(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            لغو
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
