import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

// Eager load critical components if needed, or lazy load everything for max performance
// Lazy Load Components
const SignIn = lazy(() => import("./sign-in/SignIn"));
const SignUp = lazy(() => import("./sign-up/SignUp"));
const ForgotPassword = lazy(() => import("./sign-in/ForgotPassword"));
const VerifyEmail = lazy(() => import("./sign-up/VerifyEmail"));

// Dashboard Layout
const Dashboard = lazy(() => import("./dashboard/Dashboard"));

// Dashboard Pages
const Home = lazy(() => import("./dashboard/Home"));
const Jobs = lazy(() => import("./dashboard/Jobs"));
const SavedJobs = lazy(() => import("./dashboard/SavedJobs"));
const Settings = lazy(() => import("./dashboard/Settings"));
const About = lazy(() => import("./dashboard/About"));
const Feedback = lazy(() => import("./dashboard/Feedback"));
const Profile = lazy(() => import("./dashboard/Profile"));
const CvUpload = lazy(() => import("./dashboard/CvUpload"));
const MatchResults = lazy(() => import("./dashboard/MatchResults"));
const JobCandidates = lazy(() => import("./dashboard/JobCandidates"));
const JobApplications = lazy(() => import("./dashboard/JobApplications"));
const MyApplications = lazy(() => import("./dashboard/MyApplications"));
const PostJob = lazy(() => import("./dashboard/PostJob"));
const Chat = lazy(() => import("./dashboard/Chat"));

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));

function App() {
  return (
    <Router>
      <Suspense fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      }>
        <Routes>
          {/* Açılışta otomatik signin'e yönlendir */}
          <Route path="/" element={<Navigate to="/signin" />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/signup" element={<SignUp />} />

          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<Home />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="saved-jobs" element={<SavedJobs />} />
            <Route path="jobs/:jobId/candidates" element={<JobCandidates />} />
            <Route path="jobs/:jobId/applications" element={<JobApplications />} />
            <Route path="my-applications" element={<MyApplications />} />
            <Route path="cv-upload" element={<CvUpload />} />
            <Route path="matches" element={<MatchResults />} />
            <Route path="post-job" element={<PostJob />} />
            <Route path="settings" element={<Settings />} />
            <Route path="about" element={<About />} />
            <Route path="feedback" element={<Feedback />} />
            <Route path="profile" element={<Profile />} />
            <Route path="chat" element={<Chat />} />
          </Route>

          <Route path="/admin" element={<Dashboard />}>
            <Route index element={<AdminDashboard />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;

