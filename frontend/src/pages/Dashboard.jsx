import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

// Sub-components
import Sidebar from '../components/dashboard/Sidebar';
import ChannelBar from '../components/dashboard/ChannelBar';
import ChatArea from '../components/dashboard/ChatArea';
import MemberList from '../components/dashboard/MemberList';
import UserProfileModal from '../components/UserProfileModal';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const socket = useSocket();
  
  const [view, setView] = useState('dms');
  const [servers, setServers] = useState([]);
  const [activeServer, setActiveServer] = useState(null);
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [dms, setDms] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState(null);

  const api = useMemo(() => {
    const url = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';
    return axios.create({
      baseURL: url,
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }, []);

  const fetchInitialData = useCallback(async () => {
    try {
      const [serversRes, dmsRes, usersRes] = await Promise.all([
        api.get('/servers'),
        api.get('/channels/dms'),
        api.get('/users')
      ]);
      setServers(serversRes.data || []);
      setDms(dmsRes.data || []);
      setAllUsers(usersRes.data || []);
    } catch (err) { console.error('Failed to fetch data', err); }
  }, [api]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Persistence on Reload
  useEffect(() => {
    const savedServerId = sessionStorage.getItem('activeServerId');
    if (savedServerId && servers.length > 0 && !activeServer) {
      const server = servers.find(s => s._id === savedServerId);
      if (server) selectServer(server);
    }
  }, [servers.length]); // Only run when servers are first loaded

  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!socket) return;
    
    const handleReceiveMessage = (message) => {
      // Don't add if it's our own message (we already added it in handleSendMessage)
      const isMine = message.senderId?._id?.toString() === (user?.id || user?._id)?.toString();
      
      if (activeChannel && message.channelId === activeChannel._id) {
        if (!isMine) setMessages(prev => [...prev, message]);
      } else {
        if (!isMine) setNotifications(prev => [...prev, message]);
      }
    };

    const handleServerUpdate = (updatedServer) => {
      setServers(prev => prev.map(s => s._id === updatedServer._id ? updatedServer : s));
      if (activeServer?._id === updatedServer._id) setActiveServer(updatedServer);
    };

    const handleUserUpdate = (updatedUser) => {
      const uId = updatedUser?._id?.toString();
      if (!uId) return;
      
      // Update all users list
      setAllUsers(prev => (prev || []).map(u => u._id?.toString() === uId ? { ...u, ...updatedUser } : u));
      
      // Update active server members
      setActiveServer(prev => {
        if (!prev || !prev.members) return prev;
        const updatedMembers = prev.members.map(m => 
          m._id?.toString() === uId ? { ...m, ...updatedUser } : m
        );
        return { ...prev, members: updatedMembers };
      });

      // Update dms
      setDms(prev => (prev || []).map(dm => ({
        ...dm,
        members: (dm.members || []).map(m => m._id?.toString() === uId ? { ...m, ...updatedUser } : m)
      })));

      // Update messages
      setMessages(prev => (prev || []).map(msg => 
        msg.senderId?._id?.toString() === uId 
          ? { ...msg, senderId: { ...msg.senderId, ...updatedUser } }
          : msg
      ));
    };

    const handleOnlineUsersUpdate = (users) => {
      setOnlineUsers(Array.isArray(users) ? users : []);
    };

    const handleDmCreated = (newDm) => {
      setDms(prev => {
        if (prev.some(dm => dm._id === newDm._id)) return prev;
        return [...prev, newDm];
      });
    };

    const handleChannelCreated = ({ serverId, channel }) => {
      if (activeServer?._id === serverId) {
        setChannels(prev => {
          if (prev.some(c => c._id === channel._id)) return prev;
          return [...prev, channel];
        });
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('server_update', handleServerUpdate);
    socket.on('user_update', handleUserUpdate);
    socket.on('online_users_update', handleOnlineUsersUpdate);
    socket.on('dm_created', handleDmCreated);
    socket.on('channel_created', handleChannelCreated);
    
    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('server_update', handleServerUpdate);
      socket.off('user_update', handleUserUpdate);
      socket.off('online_users_update', handleOnlineUsersUpdate);
      socket.off('dm_created', handleDmCreated);
      socket.off('channel_created', handleChannelCreated);
    };
  }, [socket, activeChannel, activeServer, user]);

  const selectChannel = useCallback(async (channel) => {
    if (!channel) return;
    setActiveChannel(channel);
    sessionStorage.setItem('activeChannelId', channel._id);
    setNotifications(prev => prev.filter(n => n.channelId !== channel._id));
    if (socket) socket.emit('join_channel', channel._id);
    try {
      const res = await api.get(`/messages/${channel._id}`);
      setMessages(res.data || []);
    } catch (err) { console.error(err); }
  }, [socket, api]);

  const selectServer = useCallback(async (server) => {
    if (!server) return;
    setView('servers');
    sessionStorage.setItem('activeServerId', server._id);
    try {
      const [serverRes, channelsRes] = await Promise.all([
        api.get(`/servers/${server._id}`),
        api.get(`/channels/${server._id}`)
      ]);
      setActiveServer(serverRes.data);
      setChannels(channelsRes.data || []);
      
      const savedChannelId = sessionStorage.getItem('activeChannelId');
      const channelToSelect = channelsRes.data?.find(c => c._id === savedChannelId) || channelsRes.data?.[0];
      
      if (channelToSelect) selectChannel(channelToSelect);
      else { setActiveChannel(null); setMessages([]); }
    } catch (err) { console.error(err); }
  }, [api, selectChannel]);

  const startDm = useCallback(async (targetUser) => {
    try {
      const res = await api.post('/channels/dms', { targetUserId: targetUser._id });
      if (!dms.some(dm => dm._id === res.data._id)) setDms(prev => [...prev, res.data]);
      selectChannel(res.data);
    } catch (err) { console.error(err); }
  }, [api, dms, selectChannel]);

  const handleCreateServer = async () => {
    const name = prompt('Enter new server name:');
    if (!name) return;
    try {
      const res = await api.post('/servers', { serverName: name });
      setServers(prev => [...prev, res.data]);
      selectServer(res.data);
    } catch (err) { console.error(err); }
  };

  const handleJoinServer = async () => {
    const id = prompt('Enter Server ID to join:');
    if (!id) return;
    try {
      const res = await api.post(`/servers/${id}/join`);
      if (!servers.some(s => s._id === res.data._id)) setServers(prev => [...prev, res.data]);
      selectServer(res.data);
    } catch (err) { alert(err.response?.data?.error || 'Invalid Server ID'); }
  };

  const [selectedImages, setSelectedImages] = useState([]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!activeChannel) return;
    if (!newMessage.trim() && selectedImages.length === 0) return;

    try {
      const formData = new FormData();
      formData.append('channelId', activeChannel._id);
      if (newMessage.trim()) formData.append('message', newMessage);
      
      selectedImages.forEach(img => {
        formData.append('images', img);
      });

      const res = await api.post('/messages', formData);
      
      if (socket) socket.emit('send_message', res.data);
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
      setSelectedImages([]);
    } catch (err) { 
      console.error('Failed to send message', err);
      alert(err.response?.data?.error || 'Failed to send message. Please make sure your backend is running and you have restarted it after the recent updates.');
    }
  };

  const getChannelName = (channel) => {
    if (!channel) return '';
    if (channel.type === 'dm') {
      const other = channel.members?.find(m => m._id !== (user?.id || user?._id));
      return other ? (other.displayName || other.username) : 'Unknown';
    }
    return channel.channelName || '';
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#313338] text-[#DBDEE1]">
      <Sidebar 
        servers={servers} activeServer={activeServer} 
        onSelectServer={selectServer} onSelectHome={() => { 
          setView('dms'); 
          setActiveServer(null); 
          setActiveChannel(null); 
          sessionStorage.removeItem('activeServerId');
          sessionStorage.removeItem('activeChannelId');
        }}
        onCreateServer={handleCreateServer} onJoinServer={handleJoinServer} view={view}
      />

      <ChannelBar 
        view={view} activeServer={activeServer} activeChannel={activeChannel}
        channels={channels || []} dms={dms || []} allUsers={allUsers || []}
        onSelectChannel={selectChannel} onStartDm={startDm}
        onCreateChannel={async () => {
          const name = prompt('Channel name:');
          if (!name) return;
          try {
            const res = await api.post('/channels', { serverId: activeServer?._id, channelName: name });
            setChannels(prev => [...(prev || []), res.data]);
            selectChannel(res.data);
          } catch (err) { console.error(err); }
        }}
        onInvite={() => { 
          if (!activeServer?._id) return;
          navigator.clipboard.writeText(activeServer._id); 
          alert(`Server ID: ${activeServer._id}\n\nThis ID has been copied to your clipboard. Share it with friends to let them join!`); 
        }}
        user={user} onLogout={logout} onOpenProfile={(id) => { setSelectedProfileId(id); setProfileModalOpen(true); }}
        notifications={notifications || []} getChannelName={getChannelName}
        onlineUsers={onlineUsers || []}
      />

      <ChatArea 
        activeChannel={activeChannel} messages={messages || []} 
        newMessage={newMessage} setNewMessage={setNewMessage}
        onSendMessage={handleSendMessage} onOpenProfile={(id) => { setSelectedProfileId(id); setProfileModalOpen(true); }}
        getChannelName={getChannelName} user={user} notifications={notifications || []}
        selectedImages={selectedImages || []} setSelectedImages={setSelectedImages}
      />

      {view === 'servers' && (
        <MemberList 
          activeServer={activeServer} 
          onOpenProfile={(id) => { setSelectedProfileId(id); setProfileModalOpen(true); }} 
          onlineUsers={onlineUsers || []}
        />
      )}

      <UserProfileModal 
        isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} 
        userId={selectedProfileId} currentUser={user} activeServer={activeServer}
        onServerUpdate={(updated) => setActiveServer(updated)}
        onProfileUpdate={(updatedUser) => {
          // Update all users list
          setAllUsers(prev => prev.map(u => u._id === updatedUser._id ? { ...u, ...updatedUser } : u));
          
          // Update active server members
          if (activeServer) {
            const updatedMembers = activeServer.members.map(m => 
              m._id === updatedUser._id ? { ...m, ...updatedUser } : m
            );
            setActiveServer({ ...activeServer, members: updatedMembers });
          }

          // Update dms
          setDms(prev => prev.map(dm => ({
            ...dm,
            members: dm.members.map(m => m._id === updatedUser._id ? { ...m, ...updatedUser } : m)
          })));
        }}
      />
    </div>
  );
};

export default Dashboard;
