import { Plus, Hash, LogOut } from 'lucide-react';

const ChannelBar = ({ 
  view, activeServer, activeChannel, channels, dms, allUsers, 
  onSelectChannel, onCreateChannel, onStartDm, onInvite, 
  user, onLogout, onOpenProfile, notifications, getChannelName, onlineUsers = []
}) => {
  return (
    <div className="w-60 bg-[#2B2D31] flex flex-col shrink-0">
      {view === 'servers' && activeServer ? (
        <>
          <div className="h-12 border-b border-[#1E1F22] flex items-center justify-between px-4 shadow-sm font-bold text-white hover:bg-[#35373C] cursor-pointer" onClick={onInvite}>
            <span className="truncate">{activeServer.serverName}</span>
            <span className="text-[10px] font-semibold text-[#949BA4] bg-[#1E1F22] px-1.5 py-0.5 rounded uppercase">Invite</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[#949BA4] mb-1 px-2">
              <span>TEXT CHANNELS</span>
              {(activeServer.ownerId === (user?.id || user?._id)) && (
                <Plus size={16} className="cursor-pointer hover:text-[#DBDEE1]" onClick={onCreateChannel} />
              )}
            </div>
            {channels.map((channel) => {
              const unreadCount = notifications.filter(n => n.channelId === channel._id).length;
              return (
                <div 
                  key={channel._id}
                  onClick={() => onSelectChannel(channel)}
                  className={`flex items-center px-2 py-1.5 rounded cursor-pointer mb-0.5 justify-between
                    ${activeChannel?._id === channel._id ? 'bg-[#404249] text-white' : 'text-[#949BA4] hover:bg-[#35373C] hover:text-[#DBDEE1]'}`}
                >
                  <div className="flex items-center truncate">
                    <Hash size={18} className="mr-1.5 shrink-0" />
                    <span className="truncate">{channel.channelName}</span>
                  </div>
                  {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <div className="h-12 border-b border-[#1E1F22] flex items-center px-4 shadow-sm text-sm text-[#949BA4] font-medium">
             Direct Messages
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {dms.map((dm) => {
              const unreadCount = notifications.filter(n => n.channelId === dm._id).length;
              const otherUser = dm.members?.find(m => m._id !== (user?.id || user?._id));
              const isOnline = onlineUsers?.includes(otherUser?._id?.toString());
              return (
                <div 
                  key={dm._id}
                  onClick={() => onSelectChannel(dm)}
                  className={`flex items-center px-2 py-1.5 rounded cursor-pointer mb-0.5 justify-between
                    ${activeChannel?._id === dm._id ? 'bg-[#404249] text-white' : 'text-[#949BA4] hover:bg-[#35373C] hover:text-[#DBDEE1]'}`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className="relative shrink-0">
                      <img src={otherUser?.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'} className="w-8 h-8 rounded-full shrink-0" />
                    </div>
                    <span className="truncate">{getChannelName(dm)}</span>
                  </div>
                  {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">{unreadCount}</span>}
                </div>
              )
            })}
            <div className="text-xs font-semibold text-[#949BA4] mb-2 px-2 mt-4 uppercase">All Users</div>
            {allUsers.map((u) => {
               return (
                <div key={u._id} onClick={() => onStartDm(u)} className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer mb-0.5 text-[#949BA4] hover:bg-[#35373C] hover:text-[#DBDEE1]">
                  <div className="relative shrink-0">
                    <img src={u.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'} className="w-8 h-8 rounded-full shrink-0" onClick={(e) => onOpenProfile(u._id, e)} />
                  </div>
                  <span className="truncate">{u.displayName || u.username}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
      
      <div className="h-[52px] bg-[#232428] flex items-center px-2 py-1.5 justify-between shrink-0">
        <div className="flex items-center gap-2 cursor-pointer hover:bg-[#3F4147] p-1 rounded flex-1 truncate" onClick={(e) => onOpenProfile(user?.id || user?._id, e)}>
          <div className="relative shrink-0">
            <img src={user?.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'} className="w-8 h-8 rounded-full shrink-0" />
          </div>
          <span className="font-semibold text-white text-sm truncate">{user?.displayName || user?.username}</span>
        </div>
        <button onClick={onLogout} className="p-1.5 text-[#B5BAC1] hover:text-white rounded hover:bg-[#3F4147] transition-colors">
          <LogOut size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChannelBar;
