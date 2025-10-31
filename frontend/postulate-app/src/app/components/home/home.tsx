"use client";

import { useRouter } from "next/navigation";
import Tutorial from "./tutorial";
import UseCase from "./useCase";
import Footer from "./footer";

export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/copilotWorkflow");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-16 mt-8">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
            Elevate Research Papers with <br></br> <span className="text-blue-600">AI Peer Reviewer</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            We help researchers clearly articulate why their work matters - the difference between acceptance and rejection.
          </p>
          <div className="text-center mt-10">
            <button 
              onClick={handleGetStarted}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-colors"
            >
              Get Started
            </button>
          </div>
        </section>
        {/* Use Cases Section */}
        <section className="mb-16">
          <UseCase />
        </section>

        {/* Tutorial Section */}
        <section className="mb-16">
          <Tutorial />
        </section>
      </div>
        {/* Footer */}
        <Footer />
    </div>
  );
}