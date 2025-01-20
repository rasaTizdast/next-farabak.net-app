import React, { useEffect } from "react";
import { Overview } from "../types";
import axios from "axios";

type Props = {
  ProductId: number;
  overviews: Overview | null;
  SetOverviews: (arg0: Overview) => void;
};

const EditModalOverview = ({ ProductId, SetOverviews, overviews }: Props) => {
  useEffect(() => {
    axios
      .get(`/api/productOverview/getProductOverview/${+ProductId}`)
      .then((data) => SetOverviews(data.data));
  }, []);

  const inputHandler = (
    e:
      | React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
      | { target: { name: string; value: string } }
  ) => {
    const { name, value } = e.target;
    if (overviews) {
      SetOverviews({
        ...overviews,
        [name]: value,
        isChanged: true,
      });
    }
  };

  return (
    <div className="flex flex-col gap-5 col-span-1 sm:col-span-2 border-y-4 border-y-gray-200 my-5 py-5">
      <label className="block">
        ویژگی اول
        <input
          type="text"
          name="Property1"
          value={overviews?.Property1 || ""}
          onChange={inputHandler}
          className="bg-gray-700 border border-gray-800 rounded w-full p-2 mt-2"
          placeholder={`ویژگی اول محصول را وارد کنید`}
        />
      </label>
      <label className="block">
        ویژگی دوم
        <input
          type="text"
          name="Property2"
          value={overviews?.Property2 || ""}
          onChange={inputHandler}
          className="bg-gray-700 border border-gray-800 rounded w-full p-2 mt-2"
          placeholder={`ویژگی دوم محصول را وارد کنید`}
        />
      </label>
      <label className="block">
        ویژگی سوم
        <input
          type="text"
          name="Property3"
          value={overviews?.Property3 || ""}
          onChange={inputHandler}
          className="bg-gray-700 border border-gray-800 rounded w-full p-2 mt-2"
          placeholder={`ویژگی سوم محصول را وارد کنید`}
        />
      </label>
      <label className="block">
        ویژگی چهارم
        <input
          type="text"
          name="Property4"
          value={overviews?.Property4 || ""}
          onChange={inputHandler}
          className="bg-gray-700 border border-gray-800 rounded w-full p-2 mt-2"
          placeholder={`ویژگی چهارم محصول را وارد کنید`}
        />
      </label>
    </div>
  );
};

export default EditModalOverview;
