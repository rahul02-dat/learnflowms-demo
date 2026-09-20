import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import LearnFlowVideoPlayer from '../components/LearnFlowVideoPlayer';
import NotesEditor from '../components/NotesEditor';
import { useCourseStore } from '../stores/courseStore';
import { PanelLeftClose, PanelLeftOpen, Maximize, CheckCircle, ExternalLink, FileText as FileTextIcon, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

const fetchSectionContent = async (sectionId: string) => {
  const { data } = await axios.get(`http://localhost:8000/api/v1/content/section/${sectionId}`);
  return data.data; // array of content items
};

export default function LearningSection() {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  
  const distractionFree = useCourseStore(state => state.distractionFree);
  const setDistractionFree = useCourseStore(state => state.setDistractionFree);
  const sidebarOpen = useCourseStore(state => state.sidebarOpen);
  const toggleSidebar = useCourseStore(state => state.toggleSidebar);

  const [activeItemIndex, setActiveItemIndex] = useState(0);

  const { data: contentItems, isLoading, error } = useQuery({
    queryKey: ['section-content', sectionId],
    queryFn: () => fetchSectionContent(sectionId!),
    enabled: !!sectionId
  });

  // Reset index when section changes
  useEffect(() => {
    setActiveItemIndex(0);
  }, [sectionId]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0d1117]">
        <div className="text-[#8b949e] animate-pulse font-mono">Loading content...</div>
      </div>
    );
  }

  if (error || !contentItems) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0d1117]">
        <div className="text-[#f85149] font-mono">Error loading content.</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] overflow-y-auto">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] sticky top-0 bg-[#0d1117] z-20">
        <div className="flex items-center gap-3">
          {!distractionFree && (
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-[#161b22] text-[#8b949e] hover:text-[#c9d1d9] transition-colors"
              title={sidebarOpen ? "Close Sidebar" : "Open Sidebar"}
            >
              {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
            </button>
          )}
          <h1 className="text-xl font-semibold text-[#e6edf3]" style={{ fontFamily: 'Fraunces, serif' }}>
            {/* The section title would ideally be fetched here or passed via context. Using placeholder for now */}
            Section Content
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setDistractionFree(!distractionFree)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm font-medium transition-colors ${
              distractionFree 
                ? 'bg-[#238636] border-[#3fb950] text-white' 
                : 'bg-transparent border-[#30363d] text-[#8b949e] hover:border-[#8b949e] hover:text-[#c9d1d9]'
            }`}
            title="Focus Mode"
          >
            <Maximize size={16} />
            <span style={{ fontFamily: 'DM Sans, sans-serif' }}>Focus</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-5xl mx-auto w-full p-6 pb-24">
        {contentItems.length === 0 ? (
          <div className="text-center py-20 text-[#8b949e] font-mono">
            No content available for this section yet.
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {(() => {
              const item = contentItems[activeItemIndex];
              if (!item) return null;
              return (
                <div key={item.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-2xl font-bold mb-6 text-[#e6edf3]" style={{ fontFamily: 'Fraunces, serif' }}>
                    {item.title}
                  </h2>
                  
                  {item.content_type === 'video' && item.media_url && (
                    <div className="mb-8 rounded-xl overflow-hidden border border-[#30363d] shadow-2xl">
                      <LearnFlowVideoPlayer 
                        sourceType="hls" 
                        src={item.media_url} 
                        onEnded={() => console.log('Video finished - mark complete')}
                      />
                    </div>
                  )}
                  
                  {item.content_type === 'text' && item.text_content && (
                    <div 
                      className="prose prose-invert max-w-none prose-p:text-[#c9d1d9] prose-p:font-['DM_Sans'] prose-p:leading-relaxed prose-headings:text-[#e6edf3] prose-headings:font-['Fraunces'] mb-8 p-6 bg-[#161b22] border border-[#30363d] rounded-xl"
                      dangerouslySetInnerHTML={{ __html: item.text_content }} 
                    />
                  )}

                  {item.content_type === 'pdf' && item.media_url && (
                    <div className="w-full h-[600px] border border-[#30363d] rounded-lg overflow-hidden bg-[#161b22] flex flex-col mb-8">
                      <div className="p-3 bg-[#21262d] border-b border-[#30363d] flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[#c9d1d9]">
                          <FileTextIcon size={16} />
                          <span className="font-mono text-sm">Document Viewer</span>
                        </div>
                        <a href={item.media_url} target="_blank" rel="noreferrer" className="text-[#58a6ff] hover:underline font-mono text-xs flex items-center gap-1">
                          Open in new tab <ExternalLink size={12} />
                        </a>
                      </div>
                      <iframe src={item.media_url} className="w-full flex-1" title={item.title} />
                    </div>
                  )}

                  {item.content_type === 'link' && item.media_url && (
                    <a 
                      href={item.media_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="block p-6 border border-[#30363d] rounded-lg bg-[#161b22] hover:bg-[#21262d] hover:border-[#8b949e] transition-colors group mb-8"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-[#58a6ff] group-hover:underline" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                          {item.media_url}
                        </h3>
                        <ExternalLink size={20} className="text-[#8b949e] group-hover:text-[#c9d1d9]" />
                      </div>
                      {item.text_content && (
                        <p className="text-[#8b949e]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                          {item.text_content}
                        </p>
                      )}
                    </a>
                  )}
                  
                  {/* Notes Editor for this content item */}
                  <div className="mt-8 pt-8 border-t border-[#30363d]">
                    <div className="flex items-center gap-2 mb-4 text-[#8b949e]">
                      <BookOpen size={18} />
                      <h3 className="font-semibold" style={{ fontFamily: 'Fraunces, serif' }}>Private Notes</h3>
                    </div>
                    <NotesEditor contentItemId={item.id} />
                  </div>
                </div>
              );
            })()}

            {/* Pagination Controls */}
            <div className="mt-12 flex items-center justify-between pt-6 border-t border-[#30363d]">
              <button
                onClick={() => setActiveItemIndex(Math.max(0, activeItemIndex - 1))}
                disabled={activeItemIndex === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                  activeItemIndex === 0 
                    ? 'text-[#484f58] cursor-not-allowed' 
                    : 'text-[#c9d1d9] hover:bg-[#21262d] border border-[#30363d]'
                }`}
              >
                <ChevronLeft size={18} /> Previous
              </button>
              
              <div className="text-sm text-[#8b949e] font-mono">
                {activeItemIndex + 1} of {contentItems.length}
              </div>
              
              <button
                onClick={() => setActiveItemIndex(Math.min(contentItems.length - 1, activeItemIndex + 1))}
                disabled={activeItemIndex === contentItems.length - 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                  activeItemIndex === contentItems.length - 1
                    ? 'text-[#484f58] cursor-not-allowed' 
                    : 'text-white bg-[#238636] hover:bg-[#2ea043]'
                }`}
              >
                Next <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Next/Complete Actions */}
        {contentItems.length > 0 && (
          <div className="mt-16 pt-8 border-t border-[#30363d] flex justify-end">
            <button 
              className="flex items-center gap-2 bg-[#238636] hover:bg-[#2ea043] text-white px-6 py-3 rounded-md font-semibold transition-colors shadow-lg"
              onClick={() => {
                // Implement progress marking here
                alert("Progress marked as complete! Redirecting to next section...");
              }}
            >
              <CheckCircle size={20} />
              <span style={{ fontFamily: 'DM Sans, sans-serif' }}>Mark as Complete</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
