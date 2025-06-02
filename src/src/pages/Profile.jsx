import { useState, useEffect } from 'react';
import { Storage, Auth } from 'aws-amplify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [nickname, setNickname] = useState('');
  const [major, setMajor] = useState('');
  const [skills, setSkills] = useState([]);
  const [selfIntro, setSelfIntro] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [message, setMessage] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});

  const navigate = useNavigate();

  const skillOptions = {
    '程式開發 Programming': ['Python', 'Java', 'C++', 'Go', 'JavaScript', 'TypeScript', 'R'],
    '前端技術 Frontend': ['React', 'Vue', 'Next.js', 'HTML/CSS', 'Bootstrap', 'Tailwind CSS'],
    '後端技術 Backend': ['Node.js', 'Express.js', 'Flask', 'Django', 'Spring Boot'],
    '資料分析與 AI Data & AI': ['SQL', 'NoSQL', 'Pandas', 'NumPy', 'Scikit-learn', 'TensorFlow', 'PyTorch', 'OpenCV', 'Hugging Face', 'LLM 應用 (LLM Apps)'],
    '雲端與開發工具 Cloud & Tools': ['AWS', 'GCP', 'Firebase', 'Docker', 'Git', 'CI/CD'],
    '設計與體驗 Design & UX': ['設計 Design', 'UI/UX', 'Figma', '使用者研究 User Research', 'Prototyping'],
    '商業與產品 Business & Product': ['行銷 Marketing', '商業分析 Business Analysis', '專案管理 Project Management', '產品思維 Product Thinking', '使用者導向設計 User-Centered Design'],
    '軟實力 Soft Skills': ['簡報 Presentation', '溝通 Communication', '團隊合作 Teamwork', '邏輯思考 Logical Thinking', '問題解決 Problem Solving', '時間管理 Time Management', '創意思考 Creative Thinking', '敏捷開發 Agile Development']
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        setNickname(user.attributes.nickname || '');

        const session = await Auth.currentSession();
        const idToken = session.getIdToken().getJwtToken();
        console.log('🔐 idToken:', idToken);
      } catch (err) {
        console.error('❌ 取得使用者資訊失敗', err);
      }
    };
    fetchUserInfo();
  }, []);

  const handleCheckboxChange = (skill) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
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
      setTimeout(() => {
        navigate('/competitions');
      }, 1000);
    } catch (err) {
      console.error(err);
      setMessage('❌ 儲存失敗：' + (err?.response?.data?.error || err.message));
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-xl">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">📝 編輯個人檔案</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <input className="w-full border border-gray-300 rounded p-3" placeholder="暱稱 Nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} />
        <input className="w-full border border-gray-300 rounded p-3" placeholder="科系 Major" value={major} onChange={(e) => setMajor(e.target.value)} />
        <textarea className="w-full border border-gray-300 rounded p-3" placeholder="自我介紹 Introduction" value={selfIntro} onChange={(e) => setSelfIntro(e.target.value)} />

        <div>
          <label className="block mb-3 text-lg font-semibold">技能 Skills（可複選）</label>
          {Object.entries(skillOptions).map(([category, options]) => (
            <div key={category} className="mb-6">
              <button
                type="button"
                onClick={() => toggleCategory(category)}
                className="text-left text-blue-600 font-medium mb-2 hover:underline"
              >
                {expandedCategories[category] ? '▼' : '▶'} {category}
              </button>
              {expandedCategories[category] && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {options.map((skill) => (
                    <label key={skill} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={skills.includes(skill)}
                        onChange={() => handleCheckboxChange(skill)}
                        className="accent-blue-600 w-4 h-4"
                      />
                      <span className="text-sm text-gray-800">{skill}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div>
          <label className="block mb-1 font-semibold">上傳履歷 Resume（PDF）</label>
          <input type="file" accept="application/pdf" onChange={handleFileChange} className="block" />
        </div>

        <button className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-3 rounded-xl transition">
          儲存並繼續 ➡️
        </button>
      </form>

      {message && (
        <p className={`mt-6 text-center text-sm ${message.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
