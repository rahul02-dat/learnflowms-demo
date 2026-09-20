import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { PlayCircle, FileText, CheckCircle, Clock } from 'lucide-react';

const fetchCourseOverview = async (courseId: string) => {
  const { data } = await axios.get(`http://localhost:8000/api/v1/courses/${courseId}`);
  return data.data;
};

export default function CourseOverview() {
  const { courseId } = useParams();
  
  const { data: course, isLoading, error } = useQuery({
    queryKey: ['course-overview', courseId],
    queryFn: () => fetchCourseOverview(courseId!),
    enabled: !!courseId
  });

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-[#8b949e] animate-pulse">Loading course details...</div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="w-full h-full min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-[#f85149]">Failed to load course details.</div>
      </div>
    );
  }

  // Get the first section ID for the "Start Learning" button
  let firstSectionLink = `/dashboard`;
  if (course.chapters?.length > 0 && course.chapters[0].subchapters?.length > 0 && course.chapters[0].subchapters[0].sections?.length > 0) {
    const ch = course.chapters[0];
    const sub = ch.subchapters[0];
    const sec = sub.sections[0];
    firstSectionLink = `/course/${course.id}/learn/chapter/${ch.id}/subchapter/${sub.id}/section/${sec.id}`;
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] p-8 pb-32">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link to="/dashboard" className="text-[#58a6ff] hover:underline mb-6 inline-block font-mono text-sm">
            ← Back to Dashboard
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[#e6edf3] mb-4" style={{ fontFamily: 'Fraunces, serif' }}>
                {course.title}
              </h1>
              <p className="text-lg text-[#8b949e] mb-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {course.description}
              </p>
              <div className="flex items-center gap-6 text-sm font-mono text-[#8b949e]">
                <span className="flex items-center gap-2">
                  <Clock size={16} /> 48h 30m Total
                </span>
                <span className="flex items-center gap-2">
                  Instructor: {course.instructor}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 min-w-[200px]">
              <Link 
                to={firstSectionLink}
                className="w-full bg-[#238636] hover:bg-[#2ea043] text-white py-3 px-6 rounded-md font-semibold text-center transition-colors shadow-lg"
              >
                Start Learning
              </Link>
              <div className="text-center font-mono text-xs text-[#8b949e]">
                0% Completed
              </div>
            </div>
          </div>
        </div>

        {/* Curriculum */}
        <div>
          <h2 className="text-2xl font-bold text-[#e6edf3] mb-8 border-b border-[#30363d] pb-4" style={{ fontFamily: 'Fraunces, serif' }}>
            Course Curriculum
          </h2>
          
          <div className="flex flex-col gap-6">
            {course.chapters?.map((chapter: any) => (
              <div key={chapter.id} className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
                <div className="bg-[#21262d] px-6 py-4 border-b border-[#30363d]">
                  <h3 className="font-semibold text-lg text-[#c9d1d9]" style={{ fontFamily: 'Fraunces, serif' }}>
                    {chapter.title}
                  </h3>
                </div>
                
                <div className="p-2">
                  {chapter.subchapters?.map((sub: any) => (
                    <div key={sub.id} className="mb-2 last:mb-0">
                      <div className="px-4 py-2 font-mono text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
                        {sub.title}
                      </div>
                      <div className="flex flex-col gap-1">
                        {sub.sections?.map((section: any) => (
                          <div 
                            key={section.id}
                            className="flex items-center justify-between px-4 py-3 mx-2 bg-[#0d1117] rounded border border-[#30363d] hover:border-[#8b949e] transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {section.title.toLowerCase().includes('video') ? (
                                <PlayCircle size={16} className="text-[#8b949e]" />
                              ) : (
                                <FileText size={16} className="text-[#8b949e]" />
                              )}
                              <span style={{ fontFamily: 'DM Sans, sans-serif' }}>
                                {section.title}
                              </span>
                            </div>
                            {section.is_gated ? (
                              <span className="text-[#8b949e] font-mono text-xs">Locked</span>
                            ) : (
                              <span className="text-[#3fb950] font-mono text-xs">Unlocked</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
