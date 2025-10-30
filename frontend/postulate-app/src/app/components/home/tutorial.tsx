
export default function Tutorial() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Tutorial</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Watch our comprehensive tutorial to get started with Postulate.
        </p>
      </div>

      <div className="flex justify-center">
        <div className="relative w-full max-w-3xl aspect-video">
          <iframe 
            width="100%" 
            height="100%" 
            src="https://www.youtube.com/embed/voLiNnZt2SQ" 
            title="Postulate Tutorial" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
            className="rounded-xl"
          ></iframe>
        </div>
      </div>
    </div>
  );
}