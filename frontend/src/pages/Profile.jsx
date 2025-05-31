import { useState, useEffect } from 'react';
import { Storage, API, Auth } from 'aws-amplify';

export default function Profile() {
  const [nickname, setNickname] = useState('');
  const [major, setMajor] = useState('');
  const [skills, setSkills] = useState([]);
  const [selfIntro, setSelfIntro] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [message, setMessage] = useState('');

  const skillOptions = ['Python', 'R', 'React', 'SQL', '設計', '簡報', '行銷'];

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        const userNickname = user.attributes.nickname;
        setNickname(userNickname || '');
      } catch (err) {
        console.error('取得使用者資訊失敗', err);
      }
    };
    fetchUserInfo();
  }, []);

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const handleCheckboxChange = (skill) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await Auth.currentAuthenticatedUser();
      const userId = user.attributes.sub;

      let resumeUrl = '';
      let resumeFilename = '';
      if (resumeFile) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        resumeFilename = `${userId}/resume_${timestamp}.pdf`;

        await Storage.put(resumeFilename, resumeFile, {
          contentType: 'application/pdf',
          level: 'public'
        });

        resumeUrl = await Storage.get(resumeFilename, {
          level: 'public'
        });
      }

      const userData = {
        body: {
          userId,
          nickname,
          major,
          skills,
          selfIntro,
          resumeFilename, // ✅ 儲存檔名
          resumeUrl       // ✅ 儲存連結
        },
      };

      await API.post('userapi', '/users', userData);
      setMessage('✅ 資料已成功儲存！');
    } catch (err) {
      console.error(err);
      setMessage('❌ 儲存失敗：' + (err.message || '請再試一次'));
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">編輯個人檔案</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="w-full border p-2" placeholder="暱稱" value={nickname} onChange={(e) => setNickname(e.target.value)} />
        <input className="w-full border p-2" placeholder="科系" value={major} onChange={(e) => setMajor(e.target.value)} />
        <textarea className="w-full border p-2" placeholder="自我介紹" value={selfIntro} onChange={(e) => setSelfIntro(e.target.value)} />

        <div>
          <label className="block mb-1">技能（可複選）</label>
          <div className="flex flex-wrap gap-2">
            {skillOptions.map((skill) => (
              <label key={skill} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  value={skill}
                  checked={skills.includes(skill)}
                  onChange={() => handleCheckboxChange(skill)}
                />
                {skill}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block mb-1">上傳履歷（PDF）</label>
          <input type="file" accept="application/pdf" onChange={handleFileChange} />
        </div>

        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
          儲存
        </button>
      </form>

      {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
    </div>
  );
}
