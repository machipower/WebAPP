import { useState, useEffect } from 'react';
import { Storage, API, Auth } from 'aws-amplify';

export default function Profile() {
  const [nickname, setNickname] = useState('');
  const [major, setMajor] = useState('');
  const [skills, setSkills] = useState([]);
  const [selfIntro, setSelfIntro] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [message, setMessage] = useState('');

  const skillOptions = [
    // 技術技能
    '前端開發', '後端開發', '資料分析', 'AI/機器學習', '雲端技術',
    // 設計與企劃
    'UI/UX設計', '簡報設計', '專案管理', '文案撰寫', '行銷策略',
    // 軟技能
    '演講技巧', '團隊協作', '跨領域溝通'
  ];

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
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
      console.log('📎 已選擇檔案:', file.name, file.type, file.size);
    } else {
      console.warn('⚠️ 未選擇任何檔案');
    }
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
      console.log('✅ 登入中使用者:', user);
    } catch (err) {
      console.error('❌ 使用者未登入或 token 過期:', err);
      setMessage('❌ 尚未登入，請重新登入後再試一次');
      return;
    }
    
    // ✅ 履歷必填判斷
    if (!resumeFile) {
      setMessage('❌ 請上傳履歷檔案');
      return;
    }

    // ✅ 檢查 resumeFile 是否為 File 物件
    if (!(resumeFile instanceof File)) {
      console.error('resumeFile 不是有效的 File 物件', resumeFile);
      setMessage('❌ 履歷檔案錯誤，請重新選擇檔案');
      return;
    }

    // ✅ 格式驗證（僅接受 PDF）
    if (resumeFile.type !== 'application/pdf') {
      setMessage('❌ 僅接受 PDF 格式的履歷');
      return;
    }

    if (!nickname || !major || !selfIntro || skills.length === 0) {
      setMessage('❌ 請完整填寫所有欄位與勾選至少一項技能');
      return;
    }


    try {
      const user = await Auth.currentAuthenticatedUser();
      const userId = user.attributes.sub;

      // 🔍 取得 AWS 臨時憑證，確認身分角色是 authenticated
      const creds = await Auth.currentCredentials();
      const identityId = creds.identityId;
      
      console.log('🪪 Credentials:', creds);
      console.log('🪪 AWS temporary credentials:', creds);
      console.log('🪪 身分識別 ID:', identityId);

      const session = await Auth.currentSession();
      console.log('access token:', session.getAccessToken().getJwtToken());

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const resumeFilename = `public/${userId}/resume_${timestamp}.pdf`;

      // ✅ 上傳至 S3（使用 public）
      console.log('⬇️ resumeFile 狀態');
      console.log('name:', resumeFile.name);
      console.log('type:', resumeFile.type);
      console.log('size:', resumeFile.size);
      console.log('instanceof File:', resumeFile instanceof File);

      const arrayBuffer = await resumeFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      await Storage.put(resumeFilename, uint8Array, {
        contentType: 'application/pdf',
        level: 'public',
      });

      // ✅ 取得公開 URL
      const bucketName = 'frontend2f0e8131c7e241409a0fc2df5ef01b43b3213-dev';
      const region = 'ap-southeast-2';
      const resumeUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${resumeFilename}`;

      const userData = {
        body: {
          userId,
          nickname,
          major,
          skills,
          selfIntro,
          resumeFilename,
          resumeUrl,
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
        <input
          className="w-full border p-2"
          placeholder="暱稱"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
        <input
          className="w-full border p-2"
          placeholder="科系"
          value={major}
          onChange={(e) => setMajor(e.target.value)}
        />
        <textarea
          className="w-full border p-2"
          placeholder="自我介紹"
          value={selfIntro}
          onChange={(e) => setSelfIntro(e.target.value)}
        />

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
