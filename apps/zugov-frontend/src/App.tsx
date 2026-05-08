import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Providers } from "../app/providers";
import { MaciProvider } from "./context/MaciContext";
import HomePage from "../app/page";
import AboutPage from "../app/about/page";
import AnalyticsPage from "../app/analytics/page";
import CommunityPage from "../app/community/[id]/page";
import DelegatesPage from "../app/delegates/page";
import KnowledgeBasePage from "../app/knowledge-base/page";
import ManageCommunitiesPage from "../app/manage-communities/page";
import EditCommunityPage from "../app/manage-communities/[id]/edit/page";
import ManageProfilePage from "../app/manage-profile/page";
import ProposalsPage from "../app/proposals/page";

export default function App() {
  return (
    <Providers>
      <MaciProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/community/:id" element={<CommunityPage />} />
            <Route path="/delegates" element={<DelegatesPage />} />
            <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
            <Route path="/manage-communities" element={<ManageCommunitiesPage />} />
            <Route path="/manage-communities/:id/edit" element={<EditCommunityPage />} />
            <Route path="/manage-profile" element={<ManageProfilePage />} />
            <Route path="/proposals" element={<ProposalsPage />} />
          </Routes>
        </BrowserRouter>
      </MaciProvider>
    </Providers>
  );
}
