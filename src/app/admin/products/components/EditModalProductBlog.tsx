import TipTapBlogEditor from "./productBlogEditor/TipTapEditor";

type Props = {
  blog: string;
  onSave: (blog: string) => void;
  slug: string;
};

const EditModalProductBlog = ({ blog, onSave, slug }: Props) => {
  return (
    <div>
      <div>توضیحات تکمیلی محصول</div>
      {slug === "" ? (
        <h1 className="my-3 text-center text-red-300 font-extrabold">
          ابتدا جزئیات پایه را وارد کنید، سپس مقاله را بنویسید.
        </h1>
      ) : (
        <>
          <h1 className="my-3 text-center text-red-300 font-extrabold">
            در صورت تغییر توضیحات تکمیلی قبل از ذخیره محصول، ابتدا مقاله را
            ذخیره کنید
          </h1>
          <TipTapBlogEditor slug={slug} onSave={onSave} blogData={blog} />
        </>
      )}
    </div>
  );
};

export default EditModalProductBlog;
