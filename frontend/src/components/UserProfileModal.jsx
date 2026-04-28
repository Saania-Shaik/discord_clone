import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ProfileEdit from './profile/ProfileEdit';
import ProfileDisplay from './profile/ProfileDisplay';

const UserProfileModal = ({ userId, isOpen, onClose, currentUser, activeServer, onServerUpdate, onProfileUpdate }) => {
  const { updateUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ displayName: '', pronouns: '', bio: '' });
  const [note, setNote] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  const api = useMemo(() => axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  }), []);

  const isOwnProfile = currentUser && (userId === currentUser.id || userId === currentUser._id);

  useEffect(() => {
    if (isOpen && userId) fetchProfile();
  }, [isOpen, userId]);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/users/${userId}/profile`);
      setProfileData(res.data);
      setEditForm({
        displayName: res.data.displayName || '',
        pronouns: res.data.pronouns || '',
        bio: res.data.bio || ''
      });
      setNote(res.data.note || '');
    } catch (err) { console.error('Error fetching profile', err); }
  };

  const handleSaveProfile = async () => {
    try {
      const res = await api.put('/users/profile', editForm);
      setProfileData({ ...profileData, ...res.data });
      setIsEditing(false);
      if (isOwnProfile) {
        updateUser(res.data);
      }
      if (onProfileUpdate) onProfileUpdate(res.data);
    } catch (err) { console.error('Error saving profile', err); }
  };

  const handleSaveNote = async () => {
    setIsSavingNote(true);
    try {
      await api.put(`/users/${userId}/note`, { content: note });
    } catch (err) { console.error('Error saving note', err); }
    finally { setIsSavingNote(false); }
  };

  const handleToggleAdmin = async () => {
    try {
      const res = await api.post(`/servers/${activeServer._id}/admin`, { targetUserId: userId });
      if (onServerUpdate) onServerUpdate(res.data);
    } catch (err) { console.error(err); }
  };

  if (!isOpen || !profileData) return null;

  const memberSince = new Date(profileData.createdAt).toLocaleDateString(undefined, { 
    month: 'short', day: 'numeric', year: 'numeric' 
  });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-[#2B2D31] w-full max-w-sm rounded-xl overflow-hidden shadow-2xl relative flex flex-col animate-slide-in-top">
        <div className="h-24 bg-[#5865F2] w-full relative">
          <button onClick={onClose} className="absolute top-3 right-3 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-1 transition-all">
            <X size={20} />
          </button>
        </div>
        
        <div className="px-4 relative h-12">
          <div className="absolute -top-12 border-[6px] border-[#2B2D31] rounded-full bg-[#2B2D31]">
            <img src={profileData.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'} alt="Avatar" className="w-[88px] h-[88px] rounded-full" />
          </div>
          {isOwnProfile && !isEditing && (
            <button onClick={() => setIsEditing(true)} className="absolute top-2 right-4 bg-[#4E5058] hover:bg-[#6D6F78] text-white text-xs px-3 py-1 rounded transition-colors">
              Edit Profile
            </button>
          )}
        </div>

        <div className="bg-[#111214] m-4 mt-2 rounded-lg p-3 flex flex-col gap-3">
          {isEditing && isOwnProfile ? (
            <ProfileEdit 
              editForm={editForm} setEditForm={setEditForm} 
              onSave={handleSaveProfile} onCancel={() => setIsEditing(false)} 
            />
          ) : (
            <ProfileDisplay 
              profileData={profileData} activeServer={activeServer} userId={userId} 
              isOwnProfile={isOwnProfile} memberSince={memberSince} currentUser={currentUser}
              note={note} setNote={setNote} onSaveNote={handleSaveNote} isSavingNote={isSavingNote}
              onToggleAdmin={handleToggleAdmin}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
