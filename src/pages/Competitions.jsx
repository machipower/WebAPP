import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ContestCard from '../components/ContestCard';

export default function Competitions() {
  const [competitions, setCompetitions] = useState([]);

  const CONTESTS_API = 'https://7rkf202nmj.execute-api.ap-southeast-2.amazonaws.com/prod/contests';

  const fetchContests = async () => {
    try {
      const res = await axios.get(CONTESTS_API);
      setCompetitions(res.data);
    } catch (err) {
      console.error('取得比賽清單失敗:', err);
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🏆 可參加的比賽清單</h1>
      <ul className="space-y-4">
        {competitions.map((c) => (
          <ContestCard key={c.contestId} contest={c} />
        ))}
      </ul>
    </div>
  );
}
