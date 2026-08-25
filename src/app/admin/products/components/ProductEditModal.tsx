import { Product } from "../types";
import ProductForm from "./ProductForm";

type ProductEditModalProps = {
  product: Product | null;
  onClose: () => void;
  refetchProducts: () => void;
  setIsEditModalOpen: (arg0: boolean) => void;
};

const ProductEditModal: React.FC<ProductEditModalProps> = ({
  product,
  onClose,
  refetchProducts,
  setIsEditModalOpen,
}) => {
  return (
    <ProductForm
      product={product}
      onClose={onClose}
      refetchProducts={refetchProducts}
      setIsEditModalOpen={setIsEditModalOpen}
    />
  );
};

export default ProductEditModal;
