// src/pages/MatchPreferences.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Auth } from 'aws-amplify';

const SKILL_OPTIONS = {
  '程式開發 Programming': ['Python', 'Java', 'C++', 'Go', 'JavaScript', 'TypeScript', 'R'],
  '前端技術 Frontend': ['React', 'Vue', 'Next.js', 'HTML/CSS', 'Bootstrap', 'Tailwind CSS'],
  '後端技術 Backend': ['Node.js', 'Express.js', 'Flask', 'Django', 'Spring Boot'],
  '資料分析與 AI Data & AI': ['SQL', 'NoSQL', 'Pandas', 'NumPy', 'Scikit-learn', 'TensorFlow', 'PyTorch', 'OpenCV', 'Hugging Face', 'LLM 應用 (LLM Apps)'],
  '雲端與開發工具 Cloud & Tools': ['AWS', 'GCP', 'Firebase', 'Docker', 'Git', 'CI/CD'],
  '設計與體驗 Design & UX': ['設計 Design', 'UI/UX', 'Figma', '使用者研究 User Research', 'Prototyping'],
  '商業與產品 Business & Product': ['行銷 Marketing', '商業分析 Business Analysis', '專案管理 Project Management', '產品思維 Product Thinking', '使用者導向設計 User-Centered Design'],
  '軟實力 Soft Skills': ['簡報 Presentation', '溝通 Communication', '團隊合作 Teamwork', '邏輯思考 Logical Thinking', '問題解決 Problem Solving', '時間管理 Time Management', '創意思考 Creative Thinking', '敏捷開發 Agile Development']
};

const PREFERENCE_API = 'https://7rkf202nmj.execute-api.ap-southeast-2.amazonaws.com/prod/match-preference';
const RECOMMEND_API = 'https://7rkf202nmj.execute-api.ap-southeast-2.amazonaws.com/prod/recommend';
const INVITE_API = 'https://7rkf202nmj.execute-api.ap-southeast-2.amazonaws.com/prod/sent-invite';
const SENT_API = 'https://7rkf202nmj.execute-api.ap-southeast-2.amazonaws.com/prod/sent_invites_record';
const RECEIVED_API = 'https://7rkf202nmj.execute-api.ap-southeast-2.amazonaws.com/prod/received-invites';

export default function MatchPreferences() {
  const { contestId } = useParams();
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [saving, setSaving] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [recStatus, setRecStatus] = useState(null);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [loadingInviteId, setLoadingInviteId] = useState(null);
  const [sentInvites, setSentInvites] = useState([]);
  const [receivedInvites, setReceivedInvites] = useState([]);

  const handleToggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const session = await Auth.currentSession();
      const idToken = session.getIdToken().getJwtToken();

      await axios.post(
        PREFERENCE_API,
        { contestId, desiredSkills: selectedSkills },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );

      alert('偏好儲存成功');
      fetchRecommendations();
    } catch (err) {
      console.error(err);
      alert('儲存失敗');
    } finally {
      setSaving(false);
    }
  };

  const fetchRecommendations = async () => {
    setLoadingRecs(true);
    try {
      const session = await Auth.currentSession();
      const idToken = session.getIdToken().getJwtToken();
      const userId = session.getIdToken().payload['sub'];

      const res = await axios.post(
        RECOMMEND_API,
        { userId, contestId },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );

      let result = res.data;
      if (typeof result.body === 'string') {
        result = JSON.parse(result.body);
      }

      setRecommendations(result.recommendations || []);
      setRecStatus(result.status);
    } catch (err) {
      console.error('取得推薦失敗:', err);
    } finally {
      setLoadingRecs(false);
    }
  };

  const sendInvite = async (toId) => {
    try {
      setLoadingInviteId(toId);
      const session = await Auth.currentSession();
      const idToken = session.getIdToken().getJwtToken();
      const fromId = session.getIdToken().payload['sub'];

      const res = await axios.post(
        INVITE_API,
        { fromId, toId, contestId },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );

      alert(res.data.message || '邀請成功');
      setSentInvites([...sentInvites, toId]);
    } catch (err) {
      alert(err.response?.data?.message || '邀請失敗');
    } finally {
      setLoadingInviteId(null);
    }
  };

  const fetchInviteStatus = async () => {
    try {
      const session = await Auth.currentSession();
      const idToken = session.getIdToken().getJwtToken();
      const userId = session.getIdToken().payload['sub'];

      const [sentRes, receivedRes] = await Promise.all([
        axios.post(SENT_API, { userId, contestId }, { headers: { Authorization: `Bearer ${idToken}` } }),
        axios.post(RECEIVED_API, { userId, contestId }, { headers: { Authorization: `Bearer ${idToken}` } })
      ]);

      setSentInvites(sentRes.data.sent || []);
      setReceivedInvites(receivedRes.data.received || []);
    } catch (err) {
      console.error('載入邀請狀態失敗', err);
    }
  };

  useEffect(() => {
    fetchInviteStatus();
  }, [contestId]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🎯 選擇你希望隊友具備的技能</h1>
      {Object.entries(SKILL_OPTIONS).map(([category, skills]) => (
        <div key={category} className="mb-4 border rounded-xl">
          <button
            type="button"
            onClick={() => toggleCategory(category)}
            className="w-full text-left px-4 py-3 font-semibold bg-gray-100 hover:bg-gray-200 rounded-t-xl"
          >
            {expandedCategories[category] ? '▼' : '▶'} {category}
          </button>
          {expandedCategories[category] && (
            <div className="p-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {skills.map((skill) => {
                const selected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleToggleSkill(skill)}
                    className={`px-4 py-2 rounded-xl border transition-all duration-200 text-sm font-medium
                      ${selected
                        ? 'bg-blue-600 text-white border-blue-700 shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-blue-100 border-gray-300'}
                    `}
                  >
                    {selected ? '✅ ' : ''}{skill}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-6 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
      >
        儲存偏好並取得推薦
      </button>

      {loadingRecs && (
        <p className="mt-4 text-gray-600 animate-pulse">🔎 正在尋找推薦隊友，請稍候...</p>
      )}

      {!loadingRecs && recommendations.length === 0 && ['no_match', 'ok', 'fallback'].includes(recStatus) && (
        <p className="mt-6 text-gray-500">
          😕 目前沒有符合條件的推薦人選，請稍後再試或調整你的技能偏好。
        </p>
      )}

      {recommendations.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">👥 推薦的隊友（{recStatus === 'fallback' ? '備選推薦' : '精準推薦'}）</h2>
          <ul className="space-y-4">
            {recommendations.map((rec) => (
              <li key={rec.userId} className="border p-4 rounded-xl shadow">
                <div className="font-semibold text-lg">{rec.nickname || rec.name || rec.userId}</div>
                <div className="text-sm text-gray-500">{rec.major}</div>
                <div className="text-sm mt-1">技能：{rec.skills?.join(', ')}</div>
                {rec.matchScore !== undefined && (
                  <div className="text-sm mt-1 text-green-600">
                    相符技能：{rec.matchedSkills?.join(', ')}（分數：{rec.matchScore}）
                  </div>
                )}
                <button
                  onClick={() => sendInvite(rec.userId)}
                  disabled={loadingInviteId === rec.userId || sentInvites.includes(rec.userId)}
                  className={`mt-2 px-4 py-2 rounded text-white ${
                    sentInvites.includes(rec.userId)
                      ? 'bg-gray-400'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {sentInvites.includes(rec.userId)
                    ? '已邀請'
                    : loadingInviteId === rec.userId
                    ? '發送中...'
                    : '發送邀請'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
