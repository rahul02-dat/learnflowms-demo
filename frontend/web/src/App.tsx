import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import CourseOverview from './pages/CourseOverview';
import DashboardLayout from './layouts/DashboardLayout';
import LearningLayout from './layouts/LearningLayout';
import LearningSection from './pages/LearningSection';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
        </Route>

        <Route path="/course/:courseId" element={<CourseOverview />} />

        <Route path="/course/:courseId/learn" element={<LearningLayout />}>
          <Route path="chapter/:chapterId/subchapter/:subchapterId/section/:sectionId" element={<LearningSection />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
