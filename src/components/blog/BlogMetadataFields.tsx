"use client";

interface BlogMetadataFieldsProps {
  title: string;
  onTitleChange: (value: string) => void;
  slug: string;
  onSlugChange: (value: string) => void;
  author: string;
  onAuthorChange: (value: string) => void;
}

const BlogMetadataFields: React.FC<BlogMetadataFieldsProps> = ({
  title,
  onTitleChange,
  slug,
  onSlugChange,
  author,
  onAuthorChange,
}) => {
  return (
    <>
      <div>
        <label htmlFor="blog-title" className="mb-1 block text-sm font-medium">
          عنوان وبلاگ
        </label>
        <input
          id="blog-title"
          type="text"
          required
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          aria-label="عنوان وبلاگ"
          className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="blog-author" className="mb-1 block text-sm font-medium">
          نویسنده
        </label>
        <input
          id="blog-author"
          type="text"
          required
          value={author}
          onChange={(e) => onAuthorChange(e.target.value)}
          aria-label="نویسنده"
          className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="blog-slug" className="mb-1 block text-sm font-medium">
          شناسه (فقط حروف انگلیسی، اعداد، خط تیره و زیرخط)
        </label>
        <input
          id="blog-slug"
          type="text"
          required
          value={slug}
          onChange={(e) => onSlugChange(e.target.value.toLowerCase().replace(/[^a-z0-9\-_]/g, ""))}
          aria-label="شناسه وبلاگ"
          className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 focus:border-blue-500 focus:outline-none"
          placeholder="مثال: my-blog-post"
          dir="ltr"
        />
        <span className="text-xs text-gray-400">
          شناسه باید به انگلیسی باشد و فقط می‌تواند شامل حروف کوچک انگلیسی، اعداد، خط تیره و زیرخط
          باشد
        </span>
      </div>
    </>
  );
};

export default BlogMetadataFields;
