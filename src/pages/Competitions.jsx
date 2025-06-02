// src/pages/Competitions.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ContestCard from '../components/ContestCard';

export default function Competitions() {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const CONTESTS_API = 'https://7rkf202nmj.execute-api.ap-southeast-2.amazonaws.com/prod/contests';

  const fetchContests = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      else setLoading(true);
      
      const res = await axios.get(CONTESTS_API);
      setCompetitions(res.data);
    } catch (err) {
      console.error('取得比賽清單失敗:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  const handleRefresh = () => {
    fetchContests(true);
  };

  // 載入狀態
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #eff6ff 0%, #f3e8ff 50%, #fdf2f8 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            border: '4px solid #ddd6fe', 
            borderTop: '4px solid #3b82f6', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280', fontWeight: '500' }}>
            載入競賽資料中... / Loading Competitions...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #eff6ff 0%, #f3e8ff 50%, #fdf2f8 100%)',
      position: 'relative'
    }}>
      {/* 背景裝飾 */}
      <div style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none'
      }}>
        <div style={{
          position: 'absolute',
          top: '80px',
          left: '40px',
          width: '128px',
          height: '128px',
          background: 'rgba(147, 197, 253, 0.2)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '160px',
          right: '80px',
          width: '192px',
          height: '192px',
          background: 'rgba(196, 181, 253, 0.15)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '80px',
          left: '33%',
          width: '96px',
          height: '96px',
          background: 'rgba(251, 207, 232, 0.25)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }}></div>
      </div>

      {/* 頂欄導航 */}
      <div style={{
        position: 'relative',
        zIndex: 20,
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Logo 區域 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
              borderRadius: '12px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '20px' }}>🏆</span>
            </div>
            <div>
              <h1 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#1f2937',
                margin: 0,
                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                MachiPower
              </h1>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: 0
              }}>
                TeamMate Match Platform
              </p>
            </div>
          </div>

          {/* 導航按鈕組 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            {/* 個人檔案按鈕 */}
            <button
              onClick={() => navigate('/profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '10px',
                padding: '8px 12px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span>👤</span>
              <span className="hidden-mobile">Profile</span>
            </button>

            {/* 邀請總覽按鈕 */}
            <button
              onClick={() => navigate('/invites')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                border: 'none',
                borderRadius: '10px',
                padding: '8px 12px',
                fontSize: '14px',
                fontWeight: '600',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(90deg, #2563eb, #7c3aed)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(90deg, #3b82f6, #8b5cf6)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span>📬</span>
              <span className="hidden-mobile">Invitations</span>
            </button>

            {/* 登出按鈕 */}
            <button
              onClick={() => {
                // 這裡可以加上登出邏輯
                console.log('登出');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '10px',
                padding: '8px 12px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#dc2626',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>🚪</span>
              <span className="hidden-mobile">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px 24px 32px'
      }}>
        {/* 頁面標題區域 */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '48px',
          paddingTop: '16px'
        }}>
          {/* 標籤 */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(8px)',
            borderRadius: '20px',
            padding: '8px 16px',
            marginBottom: '24px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <span style={{ fontSize: '16px' }}>🎯</span>
            <span style={{ 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#374151' 
            }}>
              MachiPower
            </span>
          </div>

          {/* 主標題 */}
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            marginBottom: '16px',
            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: '1.2'
          }}>
            🏆 Available Competitions 🏆
          </h1>
          
          <h2 style={{
            fontSize: '28px',
            color: '#6b7280',
            fontWeight: 'normal',
            marginBottom: '16px'
          }}>
            
          </h2>

          <p style={{
            fontSize: '18px',
            color: '#6b7280',
            maxWidth: '512px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            
            <br />
            <span style={{ fontSize: '16px' }}>
              Discover exciting competition opportunities, challenge yourself, and showcase your talents
            </span>
          </p>
        </div>

        {/* 統計資訊與操作區域 */}
        <div style={{
          display: 'flex',
          flexDirection: window.innerWidth < 640 ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px',
          gap: '16px'
        }}>
          {/* 統計資訊 */}
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            alignItems: 'center', 
            gap: '24px' 
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(8px)',
              borderRadius: '16px',
              padding: '16px 24px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px' 
              }}>
                <span style={{ fontSize: '20px' }}>📈</span>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontWeight: 'bold', 
                    fontSize: '24px', 
                    color: '#1f2937' 
                  }}>
                    {competitions.length}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#6b7280' 
                  }}>
                    Active Competitions
                  </div>
                </div>
              </div>
            </div>

            
          </div>

          {/* 操作按鈕 */}
          <div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(8px)',
                color: '#374151',
                fontWeight: '500',
                padding: '8px 16px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: refreshing ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                opacity: refreshing ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!refreshing) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                  e.currentTarget.style.boxShadow = '0 8px 12px rgba(0, 0, 0, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (!refreshing) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                }
              }}
            >
              <span style={{ 
                fontSize: '16px',
                animation: refreshing ? 'spin 1s linear infinite' : 'none'
              }}>
                🔄
              </span>
              <span>
                {refreshing ? 'Updating...' : 'Refresh'}
              </span>
            </button>
          </div>
        </div>

        {/* 競賽列表 */}
        <div style={{ 
          maxWidth: '1024px', 
          margin: '0 auto' 
        }}>
          {competitions.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '64px 0' 
            }}>
              <div style={{ 
                fontSize: '64px', 
                marginBottom: '16px' 
              }}>
                🏆
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#6b7280',
                marginBottom: '8px'
              }}>
                暫無可用競賽 / No Available Competitions
              </h3>
              <p style={{ color: '#9ca3af' }}>
                請稍後再試或聯繫管理員 / Please try again later or contact administrator
              </p>
            </div>
          ) : (
            <ul style={{ 
              listStyle: 'none', 
              padding: 0, 
              margin: 0 
            }}>
              {competitions.map((contest, index) => (
                <div
                  key={contest.contestId}
                  style={{
                    opacity: 0,
                    transform: 'translateY(20px)',
                    animation: `fadeIn 0.6s ease-out ${index * 100}ms forwards`
                  }}
                >
                  <ContestCard contest={contest} />
                </div>
              ))}
            </ul>
          )}
        </div>

        {/* 底部提示 */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '64px' 
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(8px)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            maxWidth: '512px',
            margin: '0 auto'
          }}>
            <div style={{ 
              fontSize: '32px', 
              marginBottom: '12px' 
            }}>
              🎖️
            </div>
            <h3 style={{
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '8px'
            }}>
              Ready to Join?
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: '#6b7280' 
            }}>
              Click any competition card to start the matching process
            </p>
          </div>
        </div>
      </div>

      {/* CSS 動畫與響應式樣式 */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 640px) {
          .hidden-mobile {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}