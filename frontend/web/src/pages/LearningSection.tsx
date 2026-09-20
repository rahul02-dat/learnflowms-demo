import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import LearnFlowVideoPlayer from '../components/LearnFlowVideoPlayer';
import { useCourseStore } from '../stores/courseStore';
import { PanelLeftClose, PanelLeftOpen, Maximize, CheckCircle } from 'lucide-react';

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

  const { data: contentItems, isLoading, error } = useQuery({
    queryKey: ['section-content', sectionId],
    queryFn: () => fetchSectionContent(sectionId!),
    enabled: !!sectionId
  });

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
            {contentItems.map((item: any) => (
              <div key={item.id} className="content-item">
                <h2 className="text-2xl font-bold mb-6 text-[#e6edf3]" style={{ fontFamily: 'Fraunces, serif' }}>
                  {item.title}
                </h2>
                
                {item.content_type === 'video' && item.media_url && (
                  <div className="mb-8">
                    <LearnFlowVideoPlayer 
                      sourceType="hls" 
                      src={item.media_url} 
                      onEnded={() => console.log('Video finished - mark complete')}
                    />
                  </div>
                )}
                
                {item.content_type === 'text' && item.text_content && (
                  <div 
                    className="prose prose-invert max-w-none prose-p:text-[#c9d1d9] prose-p:font-['DM_Sans'] prose-p:leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: item.text_content }} 
                  />
                )}
              </div>
            ))}
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
