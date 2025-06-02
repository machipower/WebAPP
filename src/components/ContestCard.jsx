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
      alert('標記失敗，請稍後再試 / Registration failed, please try again');
    }
  };

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return dateString.slice(0, 10);
  };

  // 計算競賽狀態
  const getContestStatus = () => {
    const now = new Date();
    const startDate = new Date(contest.startTime);
    const endDate = new Date(contest.endTime);

    if (now < startDate) {
      return { text: 'Coming Soon', color: 'yellow' };
    } else if (now >= startDate && now <= endDate) {
      return { text: 'Ongoing', color: 'green' };
    } else {
      return { text: 'Ended', color: 'gray' };
    }
  };

  const status = getContestStatus();

  return (
    <li style={{
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      padding: '24px',
      position: 'relative',
      transition: 'all 0.3s ease',
      marginBottom: '16px'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 20px 25px rgba(0, 0, 0, 0.1)';
      e.currentTarget.style.background = 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      e.currentTarget.style.background = 'white';
    }}>
      
      {/* 頂部彩色條 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)',
        borderRadius: '16px 16px 0 0'
      }} />
      
      <div>
        {/* 標題區域 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              color: '#1f2937',
              marginBottom: '4px',
              lineHeight: '1.3'
            }}>
              {contest.name}
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Competition</p>
          </div>
          
          {/* 狀態標籤 */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '500',
            backgroundColor: status.color === 'yellow' ? '#fef3c7' : status.color === 'green' ? '#d1fae5' : '#f3f4f6',
            color: status.color === 'yellow' ? '#92400e' : status.color === 'green' ? '#065f46' : '#374151'
          }}>
            <span>⏰</span>
            <span>{status.text}</span>
          </div>
        </div>

        {/* 時間資訊 */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563', marginBottom: '8px' }}>
            <span>📅</span>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>Duration</span>
          </div>
          
          <div style={{
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            padding: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', marginBottom: '4px' }}>
              <span style={{ color: '#6b7280' }}>Start:</span>
              <span style={{ fontWeight: '500', color: '#1f2937' }}>{formatDate(contest.startTime)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
              <span style={{ color: '#6b7280' }}>End:</span>
              <span style={{ fontWeight: '500', color: '#1f2937' }}>{formatDate(contest.endTime)}</span>
            </div>
          </div>
        </div>

        {/* 額外資訊 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>👥</span>
            <span>Open Registration</span>
          </div>
        </div>

        {/* 按鈕區域 */}
        <div>
          <button
            onClick={handleClick}
            style={{
              width: '100%',
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
              color: 'white',
              fontWeight: '600',
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '16px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(90deg, #2563eb, #7c3aed)';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(90deg, #3b82f6, #8b5cf6)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <span>🙋 Go to Matching 💁</span>
            <span style={{ transition: 'transform 0.3s ease' }}>→</span>
          </button>
        </div>
      </div>
    </li>
  );
}