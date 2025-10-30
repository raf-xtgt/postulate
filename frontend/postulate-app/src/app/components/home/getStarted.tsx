
export default function GetStarted() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Get Started with Postulate</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Begin your AI research journey with our intuitive platform designed for researchers and developers.
        </p>
      </div>

      <div className="text-center mt-10">
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-colors">
          Start Your Project
        </button>
      </div>
    </div>
  );
}