import React, { useEffect, useState } from "react";
import Title from "../Components/Title";
import ProductItem from "../Components/ProductItem";
import api from "../api/axios";
import { getImageUrl } from "../utils/getImageUrl";

const RelatedProducts = ({ productId }) => {
  const [related, setRelated] = useState([]);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const res = await api.get(`/products/${productId}/related?mode=parent`);
        const data = res.data.map((item) => ({
          ...item,
          image: getImageUrl(item.image_url),
        }));
        setRelated(data);
      } catch (err) {
        console.error("Failed fetch related products", err);
      }
    };

    if (productId) fetchRelated();
  }, [productId]);

  return (
    <div className="flex flex-col gap-5 px-5 mt-10">
      <Title text1="Related " text2="Products" />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {related.map((item) => (
          <ProductItem
            key={item.id}
            id={item.id}
            image={item.image}
            name={item.name}
            price={item.price}
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
