import { Header } from "../components/Header";
import { Target, Users, Vote, Shield } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About ZuGov</h1>
          <p className="text-lg text-gray-600 mb-8">
            ZuGov is a modern community voting aggregation platform that serves as a unified layer for multiple
            governance processes across decentralized communities.
          </p>

          <div className="space-y-8">
            {/* Mission */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Target className="w-6 h-6 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">Our Mission</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                To democratize access to community governance by providing a comprehensive platform that aggregates
                voting mechanisms, enables transparent decision-making, and fosters meaningful participation across
                diverse communities.
              </p>
            </div>

            {/* Features */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Vote className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">Key Features</h2>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">Multi-Authentication Support</p>
                    <p className="text-gray-600">
                      Support for Zupass, EAS, Gitcoin Passport, Token & NFT Gating, and traditional wallet connections
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">Flexible Voting Mechanisms</p>
                    <p className="text-gray-600">Simple majority, quadratic voting, and ranked choice voting options</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">Anonymous Forum</p>
                    <p className="text-gray-600">Enable community discussions while preserving voter privacy</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">Comprehensive Analytics</p>
                    <p className="text-gray-600">
                      Track participation, engagement, and governance metrics across communities
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Identity & Privacy */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">Identity & Privacy</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                ZuGov prioritizes both verified identity and user privacy. Our platform supports multiple identity
                verification methods while maintaining the option for anonymous participation in community forums. We
                believe in empowering communities to set their own standards for participation while protecting
                individual privacy.
              </p>
            </div>

            {/* Community Driven */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Users className="w-6 h-6 text-yellow-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">Community Driven</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                ZuGov is built by the community, for the community. We aggregate governance processes from various
                communities while giving each the flexibility to maintain their unique identity, voting mechanisms, and
                participation requirements. Whether you're a protocol, public goods project, or ecosystem initiative,
                ZuGov provides the infrastructure to scale your governance effectively.
              </p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Get Involved</h2>
          <p className="mb-6">Interested in bringing your community to ZuGov?</p>
          <button className="px-8 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors">
            Contact Us
          </button>
        </div>
      </main>
    </div>
  );
}
