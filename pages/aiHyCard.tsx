//References: 1: AI Implementation - https://www.youtube.com/watch?v=oacBV4tnuYQ&ab_channel=Cybernatico
//2: AI Implementation - https://www.freecodecamp.org/news/generate-images-using-react-and-dall-e-api-react-and-openai-api-tutorial/
//3: Claude-3.7 Sonnet: Used to redesign the page visually. Prompt: "How can I make this page look more modern?"
import { useState } from "react";
import { dalle } from "../utils/api";

//Defines the AIHyCard function
export default function AIHyCard() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

    //Generates the image
  const generateImage = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }
    setLoading(true);
    setError("");

    //Calls the DALL-E API to generate the image, ensures that it only returns greeting card designs
    try {
      const response = await dalle.generateImage(`${prompt}, greeting card design`);
      setImageUrl(response.imageUrl);
    } catch (err) {
      setError("Failed to generate image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  //UI for the AIHyCard page
  return (
    <div className="min-h-screen text-white p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <h1 className="text-4xl font-bold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-violet-300">
            <span className="mr-2"></span> Create Your AI HyCard
          </h1>
          
          <p className="text-center text-indigo-200 mb-8 max-w-xl mx-auto">
            Transform your ideas into HyCards with AI. The more descriptive your prompt, the better the results.
          </p>
          
          <div className="relative mb-6">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your perfect HyCard..."
              className="w-full px-6 py-4 bg-white/20 backdrop-blur-sm border border-indigo-300/30 rounded-xl 
                         text-white placeholder-indigo-200 shadow-inner
                         focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={generateImage}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-pink-500 to-indigo-600 rounded-xl font-medium
                         shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1
                         disabled:opacity-70 disabled:transform-none disabled:hover:shadow-lg"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating your custom HyCard...
                </div>
              ) : (
                "Create AI HyCard"
              )}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-center">
              <p className="text-red-200">{error}</p>
            </div>
          )}
        </div>
        
        {imageUrl && (
          <div className="mt-4 w-full">
            <div className="relative p-6 pt-0">
              <div className="aspect-w-5 aspect-h-3 bg-white/5 rounded-xl overflow-hidden shadow-lg mx-auto max-w-2xl">
                <img 
                  src={imageUrl} 
                  alt="Generated HyCard" 
                  className="object-contain w-full h-full rounded-xl"
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = "/placeholder-image.jpg"; 
                    setError("Image failed to load. Try refreshing or generating a new one.");
                  }}
                />
              </div>
              <div className="flex justify-between items-center mt-4 px-4">
                <p className="text-indigo-200 font-medium">Your AI-generated HyCard</p>
                <a 
                  href={imageUrl}
                  download="hycard.jpg"
                  className="text-sm px-4 py-2 bg-indigo-600/40 hover:bg-indigo-600/60 rounded-lg transition-colors cursor-pointer"
                >
                  Download your AI-HyCard!
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-8 text-indigo-300 text-sm text-center max-w-md">
        <p>Try prompts like "birthday celebration with dog wearing a party hat", "congratulations on your new job, comical", or "Anniversary card with roses"</p>
      </div>
    </div>
  );
}