import { Hash, Send, Bell, MessageSquare, PlusCircle } from 'lucide-react';
import { useRef } from 'react';

const ChatArea = ({ 
  activeChannel, messages, newMessage, setNewMessage, onSendMessage, 
  onOpenProfile, getChannelName, user, notifications, selectedImages, setSelectedImages
}) => {
  const fileInputRef = useRef(null);

  const getFullImageUrl = (path) => {
    if (!path) return null;
    const baseUrl = (import.meta.env?.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
    return `${baseUrl}${path}`;
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5); // Limit to 5
    if (files.length > 0) {
      setSelectedImages(files);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 relative bg-[#313338]">
      {notifications.length > 0 && !activeChannel && (
        <div className="absolute top-4 right-4 bg-[#5865F2] text-white px-4 py-2 rounded shadow-lg flex items-center gap-2 z-50 animate-slide-in-top animate-pulse-subtle">
          <Bell size={16} />
          <span className="font-medium text-sm">New messages waiting!</span>
        </div>
      )}

      {activeChannel ? (
        <>
          <div className="h-12 border-b border-[#1E1F22] flex items-center px-4 shadow-sm shrink-0">
            <Hash size={24} className="text-[#80848E] mr-2" />
            <span className="font-bold text-white text-lg">{getChannelName(activeChannel)}</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {messages.map((msg, idx) => (
              <div key={idx} className="flex gap-4 hover:bg-[#2E3035] p-2 -mx-2 rounded group">
                <img 
                  src={msg.senderId?.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'} 
                  className="w-10 h-10 rounded-full mt-0.5 cursor-pointer hover:opacity-80 shrink-0" 
                  onClick={(e) => onOpenProfile(msg.senderId?._id, e)}
                />
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                      <span 
                        className="font-medium text-white hover:underline cursor-pointer truncate" 
                        onClick={(e) => onOpenProfile(msg.senderId?._id, e)}
                      >
                        {msg.senderId?._id?.toString() === (user?.id || user?._id)?.toString() 
                          ? 'You' 
                          : (msg.senderId?.displayName || msg.senderId?.username || 'Unknown')}
                      </span>
                      <span className="text-xs text-[#949BA4] shrink-0">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                  </div>
                  {msg.message && <span className="text-[#DBDEE1] whitespace-pre-wrap break-words">{msg.message}</span>}
                  
                  {msg.imageUrls && msg.imageUrls.length > 0 && (
                    <div className={`mt-2 grid gap-2 ${msg.imageUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} max-w-xl`}>
                      {msg.imageUrls.map((url, i) => (
                        <div key={i} className="rounded-lg overflow-hidden border border-[#2B2D31]">
                          <img 
                            src={getFullImageUrl(url)} 
                            alt={`Shared ${i}`} 
                            className="w-full h-48 object-cover hover:scale-[1.02] transition-transform cursor-pointer"
                            onClick={() => window.open(getFullImageUrl(url), '_blank')}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 pt-0 shrink-0">
            {selectedImages.length > 0 && (
              <div className="mx-4 mb-2 p-2 bg-[#2B2D31] rounded-lg flex gap-2 overflow-x-auto">
                {selectedImages.map((file, i) => (
                  <img 
                    key={i}
                    src={URL.createObjectURL(file)} 
                    className="h-20 w-20 object-cover rounded border border-[#1E1F22]" 
                    alt="Upload preview"
                  />
                ))}
              </div>
            )}
            <form onSubmit={onSendMessage} className="bg-[#383A40] rounded-lg flex items-center px-4 py-2.5 gap-2">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                multiple
                className="hidden"
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current.click()}
                className="text-[#B5BAC1] hover:text-[#DBDEE1] transition-colors"
              >
                <PlusCircle size={22} />
              </button>
              <input 
                type="text" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Message ${getChannelName(activeChannel)}`}
                className="flex-1 bg-transparent outline-none text-[#DBDEE1] placeholder-[#80848E]"
              />
              <button type="submit" className="text-[#80848E] hover:text-[#DBDEE1] ml-2 transition-colors">
                <Send size={20} />
              </button>
            </form>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-[#949BA4] gap-4">
          <MessageSquare size={64} className="text-[#404249]" />
          <h3 className="text-xl font-bold text-white">Welcome back, {user?.username}!</h3>
          <p className="text-sm">Select a channel or DM to start chatting.</p>
        </div>
      )}
    </div>
  );
};

export default ChatArea;
