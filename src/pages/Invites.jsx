import { useState, useEffect } from 'react';
import { Auth } from 'aws-amplify';
import axios from 'axios';

const SENT_API = 'https://7rkf202nmj.execute-api.ap-southeast-2.amazonaws.com/prod/sent_invites_record';
const RECEIVED_API = 'https://7rkf202nmj.execute-api.ap-southeast-2.amazonaws.com/prod/received-invites';
const CONTESTS_API = 'https://7rkf202nmj.execute-api.ap-southeast-2.amazonaws.com/prod/contests';
const USERS_API = 'https://7rkf202nmj.execute-api.ap-southeast-2.amazonaws.com/prod/users';

export default function Invites() {
  const [contestId, setContestId] = useState('');
  const [contestOptions, setContestOptions] = useState([]);
  const [sentInvites, setSentInvites] = useState([]);
  const [receivedInvites, setReceivedInvites] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchContests = async () => {
    try {
      const res = await axios.get(CONTESTS_API);
      setContestOptions(res.data || []);
    } catch (err) {
      console.error('無法取得比賽列表', err);
    }
  };

  const parseSkills = (rawSkills) => {
    if (!Array.isArray(rawSkills)) return [];
    return rawSkills.map((s) => {
      if (typeof s === 'string') return s;
      if (s && typeof s === 'object' && s.S) return s.S;
      return '';
    }).filter(Boolean);
  };

  const fetchUserProfiles = async () => {
    try {
      const session = await Auth.currentSession();
      const idToken = session.getIdToken().getJwtToken();

      const res = await axios.get(USERS_API, {
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      });

      const map = {};
      for (const user of res.data || []) {
        const parsedUser = {
          userId: user.userId,
          nickname: user.nickname || '',
          major: user.major || '',
          skills: parseSkills(user.skills)
        };
        map[user.userId] = parsedUser;
      }
      setUserMap(map);
    } catch (err) {
      console.error('無法載入使用者資訊', err);
    }
  };

  const fetchInvites = async () => {
    if (!contestId) return;
    setLoading(true);
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
      console.error('載入邀請紀錄失敗', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContests();
    fetchUserProfiles();
  }, []);

  useEffect(() => {
    fetchInvites();
  }, [contestId]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📬 邀請總覽</h1>

      <label className="block mb-2 text-gray-700">請選擇比賽</label>
      <select
        className="border border-gray-300 rounded p-2 w-full mb-6"
        value={contestId}
        onChange={(e) => setContestId(e.target.value)}
      >
        <option value="">-- 請選擇比賽 --</option>
        {contestOptions.map((c) => (
          <option key={c.contestId} value={c.contestId}>
            {c.name || c.contestId}
          </option>
        ))}
      </select>

      {loading && <p className="text-gray-500">載入中...</p>}

      {!loading && (
        <>
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-2">📤 我發送的邀請</h2>
            {sentInvites.length === 0 ? (
              <p className="text-gray-500">尚未發送邀請</p>
            ) : (
              <ul className="space-y-2">
                {sentInvites.map((userId) => {
                const target = userMap[userId] || {};
                return (
                    <li key={userId} className="p-3 border rounded-xl shadow">
                    <div className="font-semibold">{target.nickname || '未命名使用者'}</div>
                    <div className="text-sm text-gray-500">{target.major || '未填寫科系'}</div>
                    <div className="text-sm mt-1">技能：{target.skills?.join(', ') || '未填寫'}</div>
                    </li>
                );
                })}

              </ul>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">📥 我收到的邀請</h2>
            {receivedInvites.length === 0 ? (
              <p className="text-gray-500">尚未收到邀請</p>
            ) : (
              <ul className="space-y-2">
                {receivedInvites.map((inv) => {
                  const sender = userMap[inv.fromId] || {};
                  return (
                    <li key={inv.fromId} className="p-3 border rounded-xl shadow">
                      <div className="font-semibold">{sender.nickname || '未命名使用者'}</div>
                      <div className="text-sm text-gray-500">{sender.major || '未填寫科系'}</div>
                      <div className="text-sm mt-1">技能：{sender.skills?.join(', ') || '未填寫'}</div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
