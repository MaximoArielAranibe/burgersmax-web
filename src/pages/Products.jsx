import { useCart } from '../context/CartContext.jsx';
import products from '../mocks/products.json';
import ProductCard from "../components/ProductCard.jsx";
import '../styles/products.scss';

export default function Products() {
  const { addToCart } = useCart();

  return (
    <div className="products__container">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onAdd={addToCart} />
      ))}
    </div>
  );
}
