//References: 1: Single product data tutorial:  https://www.youtube.com/watch?v=F7fNEkSHvEw&ab_channel=JBWEBDEVELOPER
//2: Allowing users to upload their own photos: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { getProductById, addToCart } from "../../utils/api";
import "../../styles/globals.css";

//Defines the product interface
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
}


export default function ProductDetail() {
  //Declares varaibles
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1); //New state for quantity
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [preloadAmount, setPreloadAmount] = useState(0);
  const [customMessage, setCustomMessage] = useState("");
const [imageFile, setImageFile] = useState<File | null>(null);
const [imageUrl, setImageUrl] = useState("");


  //Fetches product by id
  useEffect(() => {
    if (!id) return;
    async function fetchProduct() {
      try {
        const response = await getProductById(id as string);
        setProduct(response.data); 
      } catch (err) {
        setError("Failed to load product.");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);
  
  //Allows users to upload their own image + view it
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file)); 
    }
  };
  

  //Adds all the product details to the cart. DB is setup so that if a value is blank, it gets stored as null. 
  const handleAddToCart = async () => {
    setMessage("");
    if (!product) return;
    try {
      const token = localStorage.getItem("token");
      
      await addToCart(product.id, quantity, preloadAmount, customMessage, imageUrl, token);
      setMessage("✅ Item added to cart with personalization!");
    } catch (err) {
      setMessage("❌ Failed to add item to cart.");
    }
  };
  
  //Displays message while loading product/error message I used for troubleshooting
  if (loading) return <p className="text-center text-gray-600">Loading product...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!product) return <p className="text-center text-gray-600">Product not found.</p>;

  //Renders UI
  return (
    
    
    <div className="min-h-screen flex items-center justify-center p-6">
     
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
        

         {/* Displays product name + View cart button for nav */}
         <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <Link href="/cart">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
              🛒 View Cart
            </button>
          </Link>
        </div>


         {/* Allows users to input a custom message */}
      <div className="mt-4">
        <label className="block text-gray-600 mb-1">Custom Message</label>
        <textarea
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          placeholder="Enter a message for the recipient..."
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
        <img src={product.image_url} alt={product.name} className="w-full h-64 object-cover rounded-md" />
        <h1 className="text-3xl font-bold mt-4">{product.name}</h1>
        <p className="text-gray-600 mt-2">{product.description}</p>
        <p className="text-xl font-semibold text-blue-600 mt-4">€{product.price}</p>
        
        {/* HyCard Quantity Selector */}
        <div className="mt-4">
          <label className="block text-gray-600 mb-1">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            min="1"
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        
        {/* HyCard Pre-load Amount */}
        <div className="mt-4">
  <label className="block text-gray-600 mb-1">Pre-load Amount (€)</label>
  <input
    type="number"
    value={preloadAmount}
    onChange={(e) => setPreloadAmount(parseFloat(e.target.value) || 0)}
    min="0"
    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
  />
</div>

      {/* Allows users to add an image to their HyCard */}
      <div className="mt-4">
        <label className="block text-gray-600 mb-1">Upload an Image</label>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        {imageUrl && <img src={imageUrl} alt="Preview" className="mt-2 w-40 h-40 object-cover rounded-md" />}
      </div>


        <button 
          onClick={handleAddToCart}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition">
          Add to Cart 🛒
        </button>

        <button
          onClick={() => router.back()}
          className="mt-4 w-full bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700 transition">
          Go Back
        </button>


        {message && <p className="mt-2 text-center text-green-600">{message}</p>}
      </div>
    </div>
  );
}
