import { FormEvent, ChangeEvent, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { responseToast } from "../../../utils/features";
import { userReducerinitialstate } from "../../../types/reducer-types";
import { useCreateProductMutation } from "../../../redux/api/Productapi";

const NewProduct = () => {
  const { user } = useSelector(
    (state: { user: userReducerinitialstate }) => state.user
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [price, setPrice] = useState<number>(1000);
  const [stock, setStock] = useState<number>(1);
  const [description, setDescription] = useState<string>("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const [newProduct] = useCreateProductMutation();
  const navigate = useNavigate();

  // ✅ Handle file selection and previews
  const changeImageHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    setPhotos(fileArray);

    // ✅ Revoke old preview URLs
    photoPreviews.forEach((url) => URL.revokeObjectURL(url));

    // ✅ Generate new preview URLs
    const previewUrls = fileArray.map((file) => URL.createObjectURL(file));
    setPhotoPreviews(previewUrls);
  };

  // ✅ Form submit handler
  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!name || !price || stock < 0 || !category) {
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price.toString());
      formData.append("stock", stock.toString());
      formData.append("category", category);

      photos.forEach((file) => {
        formData.append("photos", file);
      });

      const res = await newProduct({ id: user?._id!, formData });
      responseToast(res, navigate, "/admin/product");

      // ✅ Clear form after success
      setName("");
      setCategory("");
      setPrice(1000);
      setStock(1);
      setDescription("");
      setPhotos([]);
      setPhotoPreviews([]);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <AdminSidebar />
      <main className="product-management">
        <article>
          <form onSubmit={submitHandler}>
            <h2>New Product</h2>

            <div>
              <label>Name</label>
              <input
                required
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label>Description</label>
              <textarea
                required
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label>Price</label>
              <input
                required
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </div>

            <div>
              <label>Stock</label>
              <input
                required
                type="number"
                placeholder="Stock"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
              />
            </div>

            <div>
              <label>Category</label>
              <input
                required
                type="text"
                placeholder="e.g., Laptop, Camera"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div>
              <label>Photos</label>
              <input
                required
                type="file"
                accept="image/*"
                multiple
                onChange={changeImageHandler} // ✅ FIXED
              />
            </div>

            {/* ✅ Show preview images */}
            <div className="preview-container" style={{ display: "flex", gap: "10px" }}>
              {photoPreviews.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Preview ${i + 1}`}
                  style={{ width: "100px", height: "100px", objectFit: "cover" }}
                />
              ))}
            </div>

            <button disabled={isLoading} type="submit">
              {isLoading ? "Creating..." : "Create"}
            </button>
          </form>
        </article>
      </main>
    </div>
  );
};

export default NewProduct;
