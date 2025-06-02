import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import axios from 'axios';

const SENT_API = 'https://7rkf202nmj.execute-api.ap-southeast-2.amazonaws.com/prod/sent_invites_record';
const RECEIVED_API = 'https://7rkf202nmj.execute-api.ap-southeast-2.amazonaws.com/prod/received-invites';
const CONTESTS_API = 'https://7rkf202nmj.execute-api.ap-southeast-2.amazonaws.com/prod/contests';
const USERS_API = 'https://7rkf202nmj.execute-api.ap-southeast-2.amazonaws.com/prod/users';

export default function Invites() {
  const navigate = useNavigate();
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
                WebkitTextFillColor: 'transparent',
                cursor: 'pointer'
              }}
              onClick={() => navigate('/')}
              >
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
            {/* 競賽總覽按鈕 */}
            <button
              onClick={() => navigate('/competitions')}
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
              <span>🏆</span>
              <span className="hidden-mobile">競賽總覽 / Competitions</span>
            </button>

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
              <span className="hidden-mobile">個人檔案 / Profile</span>
            </button>

            {/* 邀請總覽按鈕 - 當前頁面，顯示為高亮 */}
            <button
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
                cursor: 'default',
                transition: 'all 0.3s ease'
              }}
            >
              <span>📬</span>
              <span className="hidden-mobile">邀請總覽 / Invitations</span>
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
              <span className="hidden-mobile">登出 / Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* 主要內容區域 */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px 24px 32px'
      }}>
        {/* 頁面標題 */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '48px',
          paddingTop: '16px'
        }}>
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
            <span style={{ fontSize: '16px' }}>📬</span>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
              Invitation Management
            </span>
          </div>
          
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            marginBottom: '16px',
            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: '1.2'
          }}>
            📬 Invitation Overview
          </h1>
          
          <p style={{
            fontSize: '18px',
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Manage your team invitations effortlessly
            <br />
            <span style={{ fontSize: '16px' }}>
              Track the invitations you've sent and received for different competitions
            </span>
          </p>
        </div>

        {/* 比賽選擇器 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          marginBottom: '32px'
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937'
          }}>
            <span>🎯</span>
            Select Competition
          </label>
          
          <select
            style={{
              width: '100%',
              border: '2px solid #e5e7eb',
              borderRadius: '16px',
              padding: '16px 20px',
              fontSize: '16px',
              background: 'rgba(255, 255, 255, 0.9)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              fontWeight: '500'
            }}
            value={contestId}
            onChange={(e) => setContestId(e.target.value)}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.boxShadow = 'none';
            }}
          >
            <option value="">-- Please select a competition --</option>
            {contestOptions.map((c) => (
              <option key={c.contestId} value={c.contestId}>
                {c.name || c.contestId}
              </option>
            ))}
          </select>
        </div>

        {/* 載入狀態 */}
        {loading && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(8px)',
            borderRadius: '24px',
            padding: '48px 32px',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              border: '4px solid #ddd6fe',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 24px'
            }}></div>
            <p style={{ color: '#6b7280', fontSize: '18px', fontWeight: '500' }}>
              🔍 Loading invitation records...
            </p>
          </div>
        )}

        {/* 邀請內容 */}
        {!loading && contestId && (
          <div style={{ 
            display: 'grid', 
            gap: '32px', 
            gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(2, 1fr)',
            maxWidth: '1024px',
            margin: '0 auto'
          }}>
            {/* 我發送的邀請 */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(8px)',
              borderRadius: '24px',
              padding: '32px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#1f2937'
              }}>
                <span>📤</span>
                Sent Invitations
                <span style={{
                  background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                  color: 'white',
                  fontSize: '12px',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontWeight: '500'
                }}>
                  {sentInvites.length}
                </span>
              </h2>
              
              {sentInvites.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '48px 24px',
                  color: '#9ca3af'
                }}>
                  <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
                  <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                    No invitations sent
                  </p>
                  <p style={{ fontSize: '14px' }}>
                    Go to matching page to invite teammates
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {sentInvites.map((userId, index) => {
                    const target = userMap[userId] || {};
                    return (
                      <div
                        key={userId}
                        style={{
                          background: 'rgba(255, 255, 255, 0.9)',
                          borderRadius: '16px',
                          padding: '20px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          transition: 'all 0.3s ease',
                          opacity: 0,
                          transform: 'translateY(20px)',
                          animation: `fadeIn 0.6s ease-out ${index * 100}ms forwards`
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          marginBottom: '12px'
                        }}>
                          <h3 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#1f2937',
                            margin: 0
                          }}>
                            {target.nickname || '未命名使用者 / Unnamed User'}
                          </h3>
                          <span style={{
                            background: 'rgba(59, 130, 246, 0.1)',
                            color: '#3b82f6',
                            fontSize: '11px',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontWeight: '600'
                          }}>
                            Sent
                          </span>
                        </div>
                        
                        <p style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          marginBottom: '12px'
                        }}>
                          📚 {target.major || '未填寫科系 / Major not specified'}
                        </p>
                        
                        <div>
                          <p style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            marginBottom: '8px',
                            fontWeight: '500'
                          }}>
                            Skills:
                          </p>
                          {target.skills && target.skills.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {target.skills.slice(0, 3).map((skill) => (
                                <span
                                  key={skill}
                                  style={{
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    color: '#3b82f6',
                                    padding: '4px 8px',
                                    borderRadius: '8px',
                                    fontSize: '11px',
                                    fontWeight: '500'
                                  }}
                                >
                                  {skill}
                                </span>
                              ))}
                              {target.skills.length > 3 && (
                                <span style={{
                                  color: '#9ca3af',
                                  fontSize: '11px',
                                  padding: '4px 8px',
                                  fontWeight: '500'
                                }}>
                                  +{target.skills.length - 3} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <span style={{
                              color: '#9ca3af',
                              fontSize: '12px',
                              fontStyle: 'italic'
                            }}>
                              Not specified
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 我收到的邀請 */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(8px)',
              borderRadius: '24px',
              padding: '32px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#1f2937'
              }}>
                <span>📥</span>
                Received Invitations
                <span style={{
                  background: 'linear-gradient(90deg, #059669, #10b981)',
                  color: 'white',
                  fontSize: '12px',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontWeight: '500'
                }}>
                  {receivedInvites.length}
                </span>
              </h2>
              
              {receivedInvites.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '48px 24px',
                  color: '#9ca3af'
                }}>
                  <div style={{ fontSize: '64px', marginBottom: '16px' }}>📪</div>
                  <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                    No invitations received
                  </p>
                  <p style={{ fontSize: '14px' }}>
                    Complete your profile to get more invitations
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {receivedInvites.map((inv, index) => {
                    const sender = userMap[inv.fromId] || {};
                    return (
                      <div
                        key={inv.fromId}
                        style={{
                          background: 'rgba(255, 255, 255, 0.9)',
                          borderRadius: '16px',
                          padding: '20px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          transition: 'all 0.3s ease',
                          opacity: 0,
                          transform: 'translateY(20px)',
                          animation: `fadeIn 0.6s ease-out ${index * 100}ms forwards`
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          marginBottom: '12px'
                        }}>
                          <h3 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#1f2937',
                            margin: 0
                          }}>
                            {sender.nickname || '未命名使用者 / Unnamed User'}
                          </h3>
                          <span style={{
                            background: 'rgba(5, 150, 105, 0.1)',
                            color: '#059669',
                            fontSize: '11px',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontWeight: '600'
                          }}>
                            New
                          </span>
                        </div>
                        
                        <p style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          marginBottom: '12px'
                        }}>
                          📚 {sender.major || '未填寫科系 / Major not specified'}
                        </p>
                        
                        <div>
                          <p style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            marginBottom: '8px',
                            fontWeight: '500'
                          }}>
                            Skills:
                          </p>
                          {sender.skills && sender.skills.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {sender.skills.slice(0, 3).map((skill) => (
                                <span
                                  key={skill}
                                  style={{
                                    background: 'rgba(5, 150, 105, 0.1)',
                                    color: '#059669',
                                    padding: '4px 8px',
                                    borderRadius: '8px',
                                    fontSize: '11px',
                                    fontWeight: '500'
                                  }}
                                >
                                  {skill}
                                </span>
                              ))}
                              {sender.skills.length > 3 && (
                                <span style={{
                                  color: '#9ca3af',
                                  fontSize: '11px',
                                  padding: '4px 8px',
                                  fontWeight: '500'
                                }}>
                                  +{sender.skills.length - 3} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <span style={{
                              color: '#9ca3af',
                              fontSize: '12px',
                              fontStyle: 'italic'
                            }}>
                              Not specified
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 未選擇比賽時的提示 */}
        {!loading && !contestId && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(8px)',
            borderRadius: '24px',
            padding: '64px 32px',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <div style={{ fontSize: '80px', marginBottom: '24px' }}>🎯</div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '12px'
            }}>
              Please Select a Competition
            </h3>
            <p style={{ 
              color: '#6b7280', 
              fontSize: '16px',
              lineHeight: '1.6'
            }}>
              Select a competition from the dropdown above to view related invitation records and manage your team connections
            </p>
          </div>
        )}

        {/* 底部提示 */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '64px' 
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(8px)',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <div style={{ 
              fontSize: '40px', 
              marginBottom: '16px' 
            }}>
              🤝
            </div>
            <h3 style={{
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '8px',
              fontSize: '18px'
            }}>
              Build Your Dream Team / 組建夢想團隊
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: '#6b7280',
              lineHeight: '1.5'
            }}>
              Connect with talented teammates and create amazing projects together
              <br />
              與優秀的隊友建立聯繫，共同創造精彩的專案
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