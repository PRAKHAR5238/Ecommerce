import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { useNavigate, useParams, Navigate as RouterNavigate } from "react-router-dom";

import {
  useDeleteProductMutation,
  useProductDetailsQuery,
  useUpdateProductMutation,
} from "../../../redux/api/Productapi";

import { userReducerinitialstate } from "../../../types/reducer-types";
import { useSelector } from "react-redux";
import { server } from "../../../redux/store";
import { SkeletonLoader } from "../../../components/loader";

const ProductManagement = () => {
  const { user } = useSelector(
    (state: { user: userReducerinitialstate }) => state.user
  );

  const params = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useProductDetailsQuery(params.id! );

  const { price = 0, photos = [], name = "", category = "", stock = 0 } = data?.product || {};

  const [priceUpdate, setPriceUpdate] = useState<number>(0);
  const [stockUpdate, setStockUpdate] = useState<number>(0);
  const [nameUpdate, setNameUpdate] = useState<string>("");
  const [categoryUpdate, setCategoryUpdate] = useState<string>("");
  const [photoUpdate, setPhotoUpdate] = useState<string>("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  useEffect(() => {
    if (data?.product) {
      setNameUpdate(data.product.name);
      setPriceUpdate(data.product.price);
      setStockUpdate(data.product.stock);
      setCategoryUpdate(data.product.category);
    }
  }, [data]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const changeImageHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setPhotoUpdate(reader.result);
          setPhotoFile(file);
        }
      };
    }
  };

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user?._id || !data?.product._id) return;

    const formData = new FormData();

    formData.set("name", nameUpdate);
    formData.set("price", priceUpdate.toString());
    formData.set("stock", stockUpdate.toString());
    formData.set("category", categoryUpdate);

    if (photoFile) {
      formData.set("photo", photoFile);
    }

    try {
      const res = await updateProduct({
        formData,
        userId: user._id,
        productId: data.product._id,
      });

      if (!("error" in res)) {
        navigate("/admin/product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const deleteProductHandler = async () => {
    if (!user?._id || !data?.product._id) return;

    try {
      const res = await deleteProduct({
        productId: data.product._id,
        userId: user._id,
      });

      if (!("error" in res)) {
        navigate("/admin/product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  if (isError) return <RouterNavigate to="/404" />;

  return (
    <div className="admin-container">
      <AdminSidebar />

      <main className="product-management">
        {isLoading ? (
          <SkeletonLoader length={20} />
        ) : (
          <>
            <section>
              <strong>ID - {data?.product._id}</strong>

              {photos[0]?.url ? (
                <img src={`${server}/${photos[0].url}`} alt="Product" />
              ) : (
                <p>No Image Available</p>
              )}

              <p>{name}</p>

              {stock > 0 ? (
                <span className="green">{stock} Available</span>
              ) : (
                <span className="red">Not Available</span>
              )}

              <h3>₹{price}</h3>
            </section>

            <article>
              <button className="product-delete-btn" onClick={deleteProductHandler}>
                <FaTrash />
              </button>

              <form onSubmit={submitHandler}>
                <h2>Manage</h2>

                <div>
                  <label>Name</label>
                  <input
                    type="text"
                    placeholder="Name"
                    value={nameUpdate}
                    onChange={(e) => setNameUpdate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label>Price</label>
                  <input
                    type="number"
                    placeholder="Price"
                    value={priceUpdate}
                    onChange={(e) => setPriceUpdate(Number(e.target.value))}
                    required
                  />
                </div>

                <div>
                  <label>Stock</label>
                  <input
                    type="number"
                    placeholder="Stock"
                    value={stockUpdate}
                    onChange={(e) => setStockUpdate(Number(e.target.value))}
                    required
                  />
                </div>

                <div>
                  <label>Category</label>
                  <input
                    type="text"
                    placeholder="e.g. laptop, camera, etc."
                    value={categoryUpdate}
                    onChange={(e) => setCategoryUpdate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label>Photo</label>
                  <input type="file" accept="image/*" onChange={changeImageHandler} />
                </div>

                {photoUpdate && (
                  <img
                    src={photoUpdate}
                    alt="New Preview"
                    style={{ width: "200px", marginTop: "1rem" }}
                  />
                )}

                <button type="submit">Update</button>
              </form>
            </article>
          </>
        )}
      </main>
    </div>
  );
};

export default ProductManagement;
