// src/pages/MatchPreferences.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Auth } from 'aws-amplify';

const SKILL_OPTIONS = [
  'Frontend', 'Backend', 'UI/UX', 'Figma', 'AI',
  'Python', 'Java', 'Communication', 'Presentation'
];

const PREFERENCE_API = 'https://7rkf202nmj.execute-api.ap-southeast-2.amazonaws.com/prod/match-preference';
const RECOMMEND_API = 'https://7rkf202nmj.execute-api.ap-southeast-2.amazonaws.com/prod/recommend';
const INVITE_API = 'https://7rkf202nmj.execute-api.ap-southeast-2.amazonaws.com/prod/sent-invite';
const SENT_API = 'https://7rkf202nmj.execute-api.ap-southeast-2.amazonaws.com/prod/sent_invites_record';
const RECEIVED_API = 'https://7rkf202nmj.execute-api.ap-southeast-2.amazonaws.com/prod/received-invites';

export default function MatchPreferences() {
  const { contestId } = useParams();
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [saving, setSaving] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [loadingInviteId, setLoadingInviteId] = useState(null);
  const [sentInvites, setSentInvites] = useState([]);
  const [receivedInvites, setReceivedInvites] = useState([]);

  const handleToggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
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

      setRecommendations(res.data.recommendations || []);
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {SKILL_OPTIONS.map((skill) => {
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

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-6 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
      >
        儲存偏好並取得推薦
      </button>

      {loadingRecs && <p className="mt-4">載入推薦中...</p>}
      {recommendations.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">👥 推薦的隊友</h2>
          <ul className="space-y-4">
            {recommendations.map((rec) => (
              <li key={rec.userId} className="border p-4 rounded-xl shadow">
                <div className="font-semibold text-lg">{rec.name}</div>
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

      {receivedInvites.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">📩 收到的邀請</h2>
          <ul className="space-y-4">
            {receivedInvites.map((r) => (
              <li key={r.fromId} className="border p-4 rounded-xl shadow">
                來自使用者 {r.fromId} 的邀請
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
