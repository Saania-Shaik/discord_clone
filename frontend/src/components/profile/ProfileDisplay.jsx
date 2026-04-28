import { Crown, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

const ProfileDisplay = ({ 
  profileData, activeServer, userId, isOwnProfile, memberSince, 
  currentUser, note, setNote, onSaveNote, isSavingNote, onToggleAdmin 
}) => {
  return (
    <>
      <div className="border-b border-[#2B2D31] pb-3">
        <div className="flex flex-col mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-[#F2F3F5] leading-tight">
              {profileData.displayName || profileData.username}
            </span>
            {activeServer && (
              <>
                {activeServer.ownerId?.toString() === userId?.toString() ? (
                  <Crown size={18} className="text-[#F5C343]" title="Server Owner" />
                ) : activeServer.admins?.some(id => id.toString() === userId?.toString()) ? (
                  <ShieldCheck size={18} className="text-[#23A559]" title="Admin" />
                ) : null}
              </>
            )}
          </div>
          <span className="text-sm text-[#B5BAC1]">{profileData.username}</span>
          {profileData.pronouns && (
            <span className="text-xs text-[#B5BAC1] mt-0.5">{profileData.pronouns}</span>
          )}
        </div>

        <div className="mt-3">
          <h3 className="text-[10px] font-bold text-[#B5BAC1] uppercase mb-1">About Me</h3>
          <p className="text-sm text-[#DBDEE1] whitespace-pre-wrap">{profileData.bio || "No bio provided."}</p>
        </div>

        <div className="mt-3">
          <h3 className="text-[10px] font-bold text-[#B5BAC1] uppercase mb-1">Member Since</h3>
          <p className="text-sm text-[#DBDEE1]">{memberSince}</p>
        </div>
      </div>
      
      {activeServer && activeServer.ownerId === currentUser.id && !isOwnProfile && (
        <div className="pt-1 pb-3 border-b border-[#2B2D31] mb-2">
          <h3 className="text-[10px] font-bold text-[#B5BAC1] uppercase mb-2">Server Roles</h3>
          <button 
            onClick={onToggleAdmin}
            className={`w-full flex items-center justify-center gap-2 text-sm py-1.5 rounded transition-colors ${
              activeServer.admins?.includes(userId) 
                ? 'bg-[#313338] text-[#F23F42] hover:bg-[#F23F42] hover:text-white' 
                : 'bg-[#313338] text-[#23A559] hover:bg-[#23A559] hover:text-white'
            }`}
          >
            {activeServer.admins?.includes(userId) ? (
              <><ShieldAlert size={16} /> Remove Admin</>
            ) : (
              <><Shield size={16} /> Make Admin</>
            )}
          </button>
        </div>
      )}

      {!isOwnProfile && (
        <div className="pt-1">
          <h3 className="text-[10px] font-bold text-[#B5BAC1] uppercase mb-1">Note</h3>
          <textarea 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={onSaveNote}
            placeholder="Click to add a note"
            className="w-full bg-transparent text-sm text-[#DBDEE1] outline-none resize-none h-12 focus:bg-[#1E1F22] rounded p-1 transition-all"
          />
          {isSavingNote && <span className="text-[10px] text-[#23A559]">Saving...</span>}
        </div>
      )}
    </>
  );
};

export default ProfileDisplay;
