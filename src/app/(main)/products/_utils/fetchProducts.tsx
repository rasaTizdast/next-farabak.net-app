// src/app/(main)/products/_utils/fetchProducts.ts

import axios from "axios";
import { notFound } from "next/navigation";

export const fetchProducts = async (url: string) => {
  try {
    const response = await axios.get(url);
    if (!response) {
      notFound();
    }
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
