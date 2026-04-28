import { Save } from 'lucide-react';

const ProfileEdit = ({ editForm, setEditForm, onSave, onCancel }) => {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="text-[10px] font-bold text-[#B5BAC1] uppercase mb-1 block">Display Name</label>
        <input 
          type="text" 
          placeholder="eg. Alex"
          value={editForm.displayName} 
          onChange={(e) => setEditForm({...editForm, displayName: e.target.value})}
          className="w-full bg-[#1E1F22] text-[#DBDEE1] text-sm p-2 rounded outline-none border border-transparent focus:border-[#5865F2]"
        />
      </div>
      <div>
        <label className="text-[10px] font-bold text-[#B5BAC1] uppercase mb-1 block">Pronouns</label>
        <input 
          type="text" 
          placeholder="they/them"
          value={editForm.pronouns} 
          onChange={(e) => setEditForm({...editForm, pronouns: e.target.value})}
          className="w-full bg-[#1E1F22] text-[#DBDEE1] text-sm p-2 rounded outline-none border border-transparent focus:border-[#5865F2]"
        />
      </div>
      <div>
        <label className="text-[10px] font-bold text-[#B5BAC1] uppercase mb-1 block">About Me</label>
        <textarea 
          placeholder="Tell us a little about yourself"
          value={editForm.bio} 
          onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
          className="w-full bg-[#1E1F22] text-[#DBDEE1] text-sm p-2 rounded outline-none resize-none h-20 border border-transparent focus:border-[#5865F2]"
        />
      </div>
      <div className="flex justify-end gap-2 mt-2">
        <button onClick={onCancel} className="text-sm text-white hover:underline transition-all">Cancel</button>
        <button onClick={onSave} className="bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm px-4 py-1.5 rounded transition-colors flex items-center gap-1">
          <Save size={14} /> Save
        </button>
      </div>
    </div>
  );
};

export default ProfileEdit;
