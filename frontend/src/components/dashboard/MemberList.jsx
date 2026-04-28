import { Crown, ShieldCheck } from 'lucide-react';

const MemberList = ({ activeServer, onOpenProfile, onlineUsers = [] }) => {
  if (!activeServer) return null;

  return (
    <div className="w-60 bg-[#2B2D31] flex flex-col shrink-0 hidden lg:flex">
      <div className="h-12 border-b border-[#1E1F22] flex items-center px-4 shadow-sm text-xs font-semibold text-[#949BA4] uppercase">
        Members — {activeServer.members?.length || 0}
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {activeServer.members?.map((m) => (
          <div 
            key={m._id} 
            onClick={(e) => onOpenProfile(m._id, e)} 
            className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer mb-0.5 text-[#949BA4] hover:bg-[#35373C] hover:text-[#DBDEE1] group transition-colors"
          >
            <div className="relative shrink-0">
              <img src={m.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'} className="w-8 h-8 rounded-full" />
            </div>
            <span className="truncate font-medium">{m.displayName || m.username}</span>
            <div className="flex gap-1 shrink-0 ml-auto">
              {activeServer.ownerId?.toString() === m._id?.toString() ? (
                <Crown size={14} className="text-[#F5C343]" />
              ) : activeServer.admins?.some(id => id.toString() === m._id?.toString()) ? (
                <ShieldCheck size={14} className="text-[#23A559]" />
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberList;
