import { useParams, NavLink, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ChevronDown, ChevronRight, Lock, CheckCircle, PlayCircle, FileText } from 'lucide-react';
import { useState } from 'react';
import { useCourseStore } from '../stores/courseStore';

const fetchCourseTree = async (courseId: string) => {
  const { data } = await axios.get(`http://localhost:8000/api/v1/courses/${courseId}`);
  return data.data;
};

function SectionItem({ section, ids }: { section: any, ids: any }) {
  const isLocked = section.is_gated; // In reality, we'd check user progress
  const to = `/course/${ids.courseId}/learn/chapter/${ids.chapterId}/subchapter/${ids.subchapterId}/section/${section.id}`;
  
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        flex items-center justify-between py-2 px-3 mx-2 my-1 rounded-md text-sm transition-colors
        ${isActive ? 'bg-[#238636] text-white font-medium' : 'text-[#8b949e] hover:bg-[#161b22] hover:text-[#c9d1d9]'}
        ${isLocked ? 'opacity-60 pointer-events-none' : ''}
      `}
    >
      <div className="flex items-center gap-2 truncate">
        {/* Mocking icon based on title, ideally backend would provide type or we infer from content */}
        {section.title.toLowerCase().includes('video') ? (
          <PlayCircle size={14} className={isLocked ? 'text-[#8b949e]' : 'text-[#3fb950]'} />
        ) : (
          <FileText size={14} className={isLocked ? 'text-[#8b949e]' : 'text-[#58a6ff]'} />
        )}
        <span className="truncate" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          {section.title}
        </span>
      </div>
      <div>
        {isLocked ? <Lock size={12} /> : <CheckCircle size={12} className="opacity-0 group-hover:opacity-100" />}
      </div>
    </NavLink>
  );
}

function SubChapterItem({ subchapter, ids }: { subchapter: any, ids: any }) {
  const [open, setOpen] = useState(true);
  
  return (
    <div className="mb-1">
      <button 
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 py-2 px-4 text-xs font-semibold text-[#8b949e] hover:text-[#c9d1d9] uppercase tracking-wider"
        style={{ fontFamily: 'JetBrains Mono, monospace' }}
      >
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {subchapter.title}
      </button>
      {open && (
        <div className="pl-2 border-l border-[#30363d] ml-6">
          {subchapter.sections?.map((section: any) => (
            <SectionItem 
              key={section.id} 
              section={section} 
              ids={{ ...ids, subchapterId: subchapter.id }} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ChapterItem({ chapter, ids }: { chapter: any, ids: any }) {
  const [open, setOpen] = useState(true);
  
  return (
    <div className="border-b border-[#30363d] pb-2 mb-2">
      <button 
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 px-4 hover:bg-[#161b22] transition-colors"
      >
        <span className="font-semibold text-[#c9d1d9]" style={{ fontFamily: 'Fraunces, serif' }}>
          {chapter.title}
        </span>
        {open ? <ChevronDown size={16} className="text-[#8b949e]" /> : <ChevronRight size={16} className="text-[#8b949e]" />}
      </button>
      
      {open && (
        <div className="mt-1">
          {chapter.subchapters?.map((sub: any) => (
            <SubChapterItem 
              key={sub.id} 
              subchapter={sub} 
              ids={{ ...ids, chapterId: chapter.id }} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CourseSidebar() {
  const { courseId } = useParams();
  
  const { data: course, isLoading, error } = useQuery({
    queryKey: ['course-tree', courseId],
    queryFn: () => fetchCourseTree(courseId!),
    enabled: !!courseId
  });

  if (isLoading) {
    return <div className="p-6 text-[#8b949e] animate-pulse">Loading curriculum...</div>;
  }

  if (error || !course) {
    return <div className="p-6 text-[#f85149]">Failed to load curriculum.</div>;
  }

  return (
    <div className="flex flex-col h-full bg-[#0d1117]">
      <div className="p-4 border-b border-[#30363d] sticky top-0 bg-[#0d1117] z-10 flex items-center justify-between">
        <Link to={`/course/${courseId}`} className="font-bold text-lg text-[#e6edf3] hover:text-[#58a6ff] transition-colors" style={{ fontFamily: 'Fraunces, serif' }} title="Back to Course Overview">
          {course.title}
        </Link>
        {/* Mobile close button could go here */}
      </div>
      
      <div className="flex-1 overflow-y-auto py-2">
        {course.chapters?.map((chapter: any) => (
          <ChapterItem 
            key={chapter.id} 
            chapter={chapter} 
            ids={{ courseId }} 
          />
        ))}
      </div>
    </div>
  );
}
