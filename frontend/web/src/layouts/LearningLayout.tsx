import { Outlet } from 'react-router-dom';
import { useCourseStore } from '../stores/courseStore';
import CourseSidebar from '../components/CourseSidebar';

export default function LearningLayout() {
  const sidebarOpen = useCourseStore((state) => state.sidebarOpen);
  const distractionFree = useCourseStore((state) => state.distractionFree);

  return (
    <div className="flex h-screen w-full bg-[#0d1117] overflow-hidden text-[#c9d1d9]">
      {/* Sidebar - hidden if distraction free or manually toggled */}
      {sidebarOpen && !distractionFree && (
        <div className="w-[320px] h-full flex-shrink-0 border-r border-[#30363d] overflow-y-auto">
          <CourseSidebar />
        </div>
      )}

      {/* Main Learning Content Area */}
      <main className="flex-1 h-full overflow-y-auto relative">
        <Outlet />
      </main>
    </div>
  );
}
