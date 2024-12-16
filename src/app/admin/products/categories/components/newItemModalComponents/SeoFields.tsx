const SeoFields = ({
  seoTitle,
  seoDescription,
  seoKeywords,
  setSeoTitle,
  setSeoDescription,
  keywordInput,
  setKeywordInput,
  addKeyword,
  removeKeyword,
  editable = true,
}: {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  setSeoTitle: React.Dispatch<React.SetStateAction<string>>;
  setSeoDescription: React.Dispatch<React.SetStateAction<string>>;
  keywordInput: string;
  setKeywordInput: React.Dispatch<React.SetStateAction<string>>;
  addKeyword: (e: React.KeyboardEvent) => void;
  removeKeyword: (keyword: string) => void;
  editable?: boolean;
}) => (
  <div>
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">
        عنوان سئو
      </label>
      <input
        type="text"
        value={seoTitle}
        onChange={(e) => setSeoTitle(e.target.value)}
        disabled={!editable}
        className="w-full p-3 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="عنوان سئو"
      />
    </div>

    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">
        توضیحات سئو
      </label>
      <textarea
        value={seoDescription}
        onChange={(e) => setSeoDescription(e.target.value)}
        disabled={!editable}
        className="w-full p-3 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="توضیحات سئو"
      />
    </div>

    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">
        کلمات کلیدی
      </label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          onKeyUp={addKeyword}
          disabled={!editable}
          className="w-full p-3 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="اضافه کردن کلمه کلیدی | بعد هر کلمه کلیدی دکمه Enter را بزنید"
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {seoKeywords.map((keyword, index) => (
          <button
            key={index}
            className="bg-emerald-100 text-gray-700 px-4 py-1 rounded-lg flex items-center gap-2 hover:bg-red-500 hover:text-white animate-fade-in transition-all"
            onClick={() => removeKeyword(keyword)}
          >
            {keyword}
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default SeoFields;
