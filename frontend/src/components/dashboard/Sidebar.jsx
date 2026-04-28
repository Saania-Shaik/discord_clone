import { Plus, UserPlus, MessageSquare } from 'lucide-react';

const Sidebar = ({ servers, activeServer, onSelectServer, onSelectHome, onCreateServer, onJoinServer, view }) => {
  return (
    <div className="w-[72px] bg-[#1E1F22] flex flex-col items-center py-3 gap-2 overflow-y-auto hidden-scrollbar shrink-0">
      <div 
        onClick={onSelectHome}
        className={`w-12 h-12 flex items-center justify-center cursor-pointer transition-all duration-200 text-white
          ${view === 'dms' ? 'bg-[#5865F2] rounded-[16px]' : 'bg-[#313338] rounded-full hover:bg-[#5865F2] hover:rounded-[16px]'}`}
      >
        <MessageSquare size={24} />
      </div>
      
      <div className="w-8 h-[2px] bg-[#35363C] rounded my-1"></div>

      {servers.map((server) => (
        <div 
          key={server._id}
          onClick={() => onSelectServer(server)}
          className={`w-12 h-12 flex items-center justify-center cursor-pointer transition-all duration-200 text-white font-bold text-lg
            ${activeServer?._id === server._id ? 'bg-[#5865F2] rounded-[16px]' : 'bg-[#313338] rounded-full hover:bg-[#5865F2] hover:rounded-[16px]'}`}
        >
          {server.serverName?.charAt(0).toUpperCase() || '?'}
        </div>
      ))}
      
      <div 
        onClick={onCreateServer}
        className="w-12 h-12 rounded-full bg-[#313338] text-[#23A559] hover:bg-[#23A559] hover:text-white flex items-center justify-center cursor-pointer transition-all duration-200 hover:rounded-[16px]"
      >
        <Plus size={24} />
      </div>
      
      <div 
        onClick={onJoinServer}
        className="w-12 h-12 rounded-full bg-[#313338] text-[#23A559] hover:bg-[#23A559] hover:text-white flex items-center justify-center cursor-pointer transition-all duration-200 hover:rounded-[16px]"
      >
        <UserPlus size={20} />
      </div>
    </div>
  );
};

export default Sidebar;
