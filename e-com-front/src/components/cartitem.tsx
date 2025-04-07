import { FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { server } from "../redux/store";
import { CartItem } from "../types/types";

type caritemprops = {
  Cartitem: CartItem;
  incrementhandeler: (CartItem: CartItem) => void;
  decrementhandeler: (CartItem: CartItem) => void;
  removeitem: (id: string) => void;
};

const cartitem = ({
  Cartitem,
  incrementhandeler,
  decrementhandeler,
  removeitem,
}: caritemprops) => {
  const { photo, name, productId, quantity, price } = Cartitem;
  return (
    <div className="cart-itms">
      <img src={`${server}/${photo}`} alt={name} />
      <article>
        <Link to={`/product/${productId}`}>{name}</Link>
        <p>
          Price:$ <strong>{price}</strong>
        </p>
      </article>

      <div>
        <button onClick={()=>decrementhandeler(Cartitem)}>-</button>
        <p>{quantity}</p>
        <button onClick={()=>incrementhandeler(Cartitem)}>+</button>
      </div>
      <button onClick={()=>removeitem(productId)}>
        <FaTrash />
      </button>
    </div>
  );
};

export default cartitem;
