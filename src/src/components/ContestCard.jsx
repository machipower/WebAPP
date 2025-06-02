// src/components/ContestCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import axios from 'axios';

export default function ContestCard({ contest }) {
  const navigate = useNavigate();

  const handleClick = async () => {
    try {
      const session = await Auth.currentSession();
      const idToken = session.getIdToken().getJwtToken();

      await axios.post(
        'https://7rkf202nmj.execute-api.ap-southeast-2.amazonaws.com/prod/interest',
        { contestId: contest.contestId },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // ✅ 標記成功後導向配對頁面
      navigate(`/match/${contest.contestId}`);
    } catch (err) {
      console.error('標記失敗:', err);
      alert('標記失敗，請稍後再試');
    }
  };

  return (
    <li className="border p-4 rounded-xl shadow">
      <div className="font-semibold text-lg">{contest.name}</div>
      <div className="text-sm text-gray-500">
        {contest.startTime?.slice(0, 10)} ~ {contest.endTime?.slice(0, 10)}
      </div>

      <button
        onClick={handleClick}
        className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        🔗 前往配對
      </button>
    </li>
  );
}
