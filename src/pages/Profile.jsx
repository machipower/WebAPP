import { useState, useEffect } from 'react';
import { Storage, Auth } from 'aws-amplify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // ✅ 加入這行

export default function Profile() {
  const [nickname, setNickname] = useState('');
  const [major, setMajor] = useState('');
  const [skills, setSkills] = useState([]);
  const [selfIntro, setSelfIntro] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [message, setMessage] = useState('');

  const navigate = useNavigate(); // ✅ 初始化導航功能

  const skillOptions = ['Python', 'R', 'React', 'SQL', '設計', '簡報', '行銷'];

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        const nickname = user.attributes.nickname || '';
        setNickname(nickname);
      } catch (err) {
        console.error('取得使用者資訊失敗', err);
      }
    };
    fetchUserInfo();
  }, []);

  const handleCheckboxChange = (skill) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file?.type === 'application/pdf') {
      setResumeFile(file);
    } else {
      alert('請上傳 PDF 格式的履歷');
      setResumeFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const user = await Auth.currentAuthenticatedUser();
      const userId = user.attributes.sub;
      const session = await Auth.currentSession();
      const idToken = session.getIdToken().getJwtToken();

      let resumeUrl = '';
      let resumeFilename = '';

      if (resumeFile) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        resumeFilename = `${userId}/resume_${timestamp}.pdf`;
        await Storage.put(resumeFilename, resumeFile, {
          contentType: 'application/pdf',
          level: 'public'
        });
        resumeUrl = await Storage.get(resumeFilename, { level: 'public' });
      }

      const payload = {
        userId,
        nickname,
        major,
        skills,
        selfIntro,
        resumeUrl
      };

      const API_URL = 'https://7rkf202nmj.execute-api.ap-southeast-2.amazonaws.com/prod/create-profile';

      await axios.post(API_URL, payload, {
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      setMessage('✅ 資料已成功儲存！');

      // ✅ 儲存成功後跳轉
      setTimeout(() => {
        navigate('/competitions');
      }, 1000);
    } catch (err) {
      console.error(err);
      setMessage('❌ 儲存失敗：' + (err?.response?.data?.error || err.message));
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
