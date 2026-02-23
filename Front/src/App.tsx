import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import PageHeader from "./components/PageHeader/PageHeader";
import Auth from "./pages/Auth/Auth"
import Profile from "./pages/Profile/Profile"
import Main from "./pages/Main/Main"
import PageWrapper from "./components/PageWrapper/PageWrapper";
import EaseOutWrapper from "./components/EaseOutWrapper/EaseOutWrapper";
import PostDetails from "./pages/PostDetails/PostDetails";

function App() {
  return (
    <PageWrapper>
      <Router>
        <EaseOutWrapper
          show={true}
          duration={800}
          style={{
            width: "100%"
          }}
        >
          <PageHeader />
        </EaseOutWrapper>
        <Routes>
          <Route path="/login" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/post/:postId" element={<PostDetails />} />
          <Route path="/" element={<Main />} />
        </Routes>
      </Router>
    </PageWrapper>
  );
}

export default App;