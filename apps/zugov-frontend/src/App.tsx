import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { Providers } from "../app/providers";
import { MaciProvider } from "./context/MaciContext";
import HomePage from "../app/page";
import AboutPage from "../app/about/page";
import AnalyticsPage from "../app/analytics/page";
import CommunityPage from "../app/community/[id]/page";
import CommunitySettingsPage from "../app/community/[id]/settings/page";
import DelegatesPage from "../app/delegates/page";
import KnowledgeBasePage from "../app/knowledge-base/page";
import ManageCommunitiesPage from "../app/manage-communities/page";
import RegisterCommunityPage from "../app/manage-communities/register/page";
import CommunityMembersPage from "../app/manage-communities/[id]/members/page";
import ManageProfilePage from "../app/manage-profile/page";
import ProposalsPage from "../app/proposals/page";
import UnionsPage from "../app/unions/page";
import UnionDetailPage from "../app/unions/[id]/page";
import { RequireAuth } from "../app/components/RequireAuth";

// Permanent redirect, no removal date (formalize-communities epic, Child C1, /plan-eng-review
// 2026-08-24) — a redirect this cheap has no real maintenance cost, so there's no payoff to ever
// removing it. Keeps old bookmarks/links to the pre-relocation settings page working forever.
function EditCommunityRedirect() {
  const { id } = useParams();
  return <Navigate to={`/community/${id}/settings`} replace />;
}

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
            <Route path="/community/:id/settings" element={<CommunitySettingsPage />} />
            <Route path="/delegates" element={<DelegatesPage />} />
            <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
            <Route element={<RequireAuth />}>
              <Route path="/manage-communities" element={<ManageCommunitiesPage />} />
              <Route path="/manage-profile" element={<ManageProfilePage />} />
            </Route>
            <Route path="/manage-communities/register" element={<RegisterCommunityPage />} />
            <Route path="/manage-communities/:id/edit" element={<EditCommunityRedirect />} />
            <Route path="/manage-communities/:id/members" element={<CommunityMembersPage />} />
            <Route path="/proposals" element={<ProposalsPage />} />
            <Route path="/unions" element={<UnionsPage />} />
            <Route path="/unions/:id" element={<UnionDetailPage />} />
          </Routes>
        </BrowserRouter>
      </MaciProvider>
    </Providers>
  );
}
