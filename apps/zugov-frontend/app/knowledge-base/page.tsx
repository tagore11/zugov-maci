import { Header } from "../components/Header";
import { Search } from "lucide-react";
import { DOCUMENTS, KNOWLEDGE_BASE_CATEGORIES } from "@/app/lib/placeholder-data";

export default function KnowledgeBasePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Knowledge Base</h1>
          <p className="text-gray-600">Comprehensive documentation and resources for ZuGov</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search documentation..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {KNOWLEDGE_BASE_CATEGORIES.map((category) => (
            <button
              key={category}
              className="px-4 py-2 rounded-lg font-medium whitespace-nowrap bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors"
            >
              {category}
            </button>
          ))}
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DOCUMENTS.map((doc) => {
            const Icon = doc.icon;
            return (
              <div
                key={doc.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <Icon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded mb-2">
                      {doc.category}
                    </span>
                    <h3 className="font-semibold text-lg text-gray-900">{doc.title}</h3>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">{doc.description}</p>
                <p className="text-xs text-gray-500">Last updated: {doc.lastUpdated}</p>
              </div>
            );
          })}
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Need More Help?</h2>
          <p className="mb-6">Can't find what you're looking for? Our community is here to help.</p>
          <div className="flex gap-4 justify-center">
            <button className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors">
              Join Discord
            </button>
            <button className="px-6 py-3 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-400 transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
