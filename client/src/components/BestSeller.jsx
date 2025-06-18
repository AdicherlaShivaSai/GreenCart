
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';

const BestSeller = () => {
  const { products } = useAppContext();

  if (!products || products.length === 0) return <p>Loading...</p>;

  return (
    <div className='mt-16' >
        <p className='text-2xl md:text-3xl font-medium'>Best Seller</p>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mt-6">
            {products.slice(0, 5).map((product, index) => (
                <ProductCard key={index} product={product} />
            ))}
        </div>
    </div>
  );
};

export default BestSeller;
