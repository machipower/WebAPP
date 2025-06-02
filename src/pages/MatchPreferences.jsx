// src/pages/MatchPreferences.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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

      alert('偏好儲存成功 / Preferences saved successfully');
      fetchRecommendations();
    } catch (err) {
      console.error(err);
      alert('儲存失敗 / Save failed');
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

      alert(res.data.message || '邀請成功 / Invitation sent successfully');
      setSentInvites([...sentInvites, toId]);
    } catch (err) {
      alert(err.response?.data?.message || '邀請失敗 / Invitation failed');
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
              <span className="hidden-mobile">Competitions Overview</span>
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
        padding: '24px'
      }}>
        {/* 頁面標題 */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(8px)',
            borderRadius: '20px',
            padding: '8px 16px',
            marginBottom: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <span style={{ fontSize: '16px' }}>🎯</span>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Team Matching</span>
          </div>
          
          <h1 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            marginBottom: '8px',
            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🎯 Choose Skills You Want in Teammates 
            
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            Select the skills you want in your teammates, and we'll help you find the best matches!
          </p>
        </div>

        {/* 技能選擇區域 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>⚡</span>
            Skill Preferences
            {selectedSkills.length > 0 && (
              <span style={{
                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                color: 'white',
                fontSize: '12px',
                padding: '4px 8px',
                borderRadius: '12px',
                fontWeight: '500'
              }}>
                {selectedSkills.length} Selected
              </span>
            )}
          </h3>

          {Object.entries(SKILL_OPTIONS).map(([category, skills]) => (
            <div key={category} style={{
              marginBottom: '20px',
              background: 'rgba(255, 255, 255, 0.6)',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <button
                type="button"
                onClick={() => toggleCategory(category)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '16px 20px',
                  background: expandedCategories[category] ? 'rgba(59, 130, 246, 0.1)' : 'rgba(249, 250, 251, 0.8)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#374151',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = expandedCategories[category] ? 'rgba(59, 130, 246, 0.1)' : 'rgba(249, 250, 251, 0.8)';
                }}
              >
                <span style={{
                  transition: 'transform 0.3s ease',
                  transform: expandedCategories[category] ? 'rotate(90deg)' : 'rotate(0deg)',
                  color: '#3b82f6'
                }}>
                  ▶
                </span>
                {category}
              </button>
              
              {expandedCategories[category] && (
                <div style={{
                  padding: '20px',
                  background: 'rgba(255, 255, 255, 0.4)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: '12px'
                }}>
                  {skills.map((skill) => {
                    const selected = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => handleToggleSkill(skill)}
                        style={{
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: selected ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                          background: selected ? 'linear-gradient(90deg, #3b82f6, #8b5cf6)' : 'rgba(255, 255, 255, 0.8)',
                          color: selected ? 'white' : '#374151',
                          fontSize: '14px',
                          fontWeight: selected ? '600' : '500',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          textAlign: 'center'
                        }}
                        onMouseEnter={(e) => {
                          if (!selected) {
                            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                            e.currentTarget.style.borderColor = '#3b82f6';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!selected) {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                            e.currentTarget.style.borderColor = '#e5e7eb';
                          }
                        }}
                      >
                        {selected ? '✅ ' : ''}{skill}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {/* 儲存按鈕 */}
          <button
            onClick={handleSave}
            disabled={saving || selectedSkills.length === 0}
            style={{
              width: '100%',
              background: saving || selectedSkills.length === 0 ? 'linear-gradient(90deg, #9ca3af, #9ca3af)' : 'linear-gradient(90deg, #059669, #10b981)',
              color: 'white',
              fontSize: '18px',
              fontWeight: '600',
              padding: '16px 32px',
              borderRadius: '16px',
              border: 'none',
              cursor: saving || selectedSkills.length === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '24px'
            }}
            onMouseEnter={(e) => {
              if (!saving && selectedSkills.length > 0) {
                e.currentTarget.style.background = 'linear-gradient(90deg, #047857, #059669)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(5, 150, 105, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!saving && selectedSkills.length > 0) {
                e.currentTarget.style.background = 'linear-gradient(90deg, #059669, #10b981)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {saving ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                處理中... / Processing...
              </>
            ) : (
              <>
                Save Preferences & Get Recommendations
                <span>🔍</span>
              </>
            )}
          </button>
        </div>

        {/* 載入推薦狀態 */}
        {loadingRecs && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(8px)',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            marginBottom: '24px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid #ddd6fe',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <p style={{ color: '#6b7280', fontSize: '16px', fontWeight: '500' }}>
              🔎 Finding recommended teammates, please wait...
            </p>
          </div>
        )}

        {/* 無推薦結果 */}
        {!loadingRecs && recommendations.length === 0 && ['no_match', 'ok', 'fallback'].includes(recStatus) && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(8px)',
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
              No Matching Recommendations
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>
              No suitable candidates found. Please try again later or adjust your skill preferences.
            </p>
          </div>
        )}

        {/* 推薦結果 */}
        {recommendations.length > 0 && (
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
              <span>👥</span>
              Recommended Teammates
              <span style={{
                background: recStatus === 'fallback' ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 'linear-gradient(90deg, #059669, #10b981)',
                color: 'white',
                fontSize: '12px',
                padding: '4px 12px',
                borderRadius: '20px',
                fontWeight: '500'
              }}>
                {recStatus === 'fallback' ? 'Alternative' : 'Precise Match'}
              </span>
            </h2>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              {recommendations.map((rec, index) => (
                <div
                  key={rec.userId}
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    transition: 'all 0.3s ease',
                    opacity: 0,
                    transform: 'translateY(20px)',
                    animation: `fadeIn 0.6s ease-out ${index * 100}ms forwards`
                  }}
                >
                  {/* 用戶基本信息 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', marginBottom: '4px' }}>
                        {rec.nickname || rec.name || rec.userId}
                      </h3>
                      <p style={{ fontSize: '14px', color: '#6b7280' }}>
                        {rec.major} | Major
                      </p>
                    </div>
                    
                    {rec.matchScore !== undefined && (
                      <div style={{
                        background: 'linear-gradient(90deg, #059669, #10b981)',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                      Match Score {rec.matchScore}
                      </div>
                    )}
                  </div>

                  {/* 技能展示 */}
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                      Skills:
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {rec.skills?.map((skill) => (
                        <span
                          key={skill}
                          style={{
                            background: 'rgba(59, 130, 246, 0.1)',
                            color: '#3b82f6',
                            padding: '4px 8px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 匹配技能 */}
                  {rec.matchedSkills && rec.matchedSkills.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{ fontSize: '14px', color: '#059669', marginBottom: '8px', fontWeight: '500' }}>
                        Matched Skills:
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {rec.matchedSkills.map((skill) => (
                          <span
                            key={skill}
                            style={{
                              background: 'rgba(5, 150, 105, 0.1)',
                              color: '#059669',
                              padding: '4px 8px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}
                          >
                            ✓ {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 邀請按鈕 */}
                  <button
                    onClick={() => sendInvite(rec.userId)}
                    disabled={loadingInviteId === rec.userId || sentInvites.includes(rec.userId)}
                    style={{
                      background: sentInvites.includes(rec.userId) 
                        ? 'linear-gradient(90deg, #9ca3af, #9ca3af)' 
                        : loadingInviteId === rec.userId 
                        ? 'linear-gradient(90deg, #d97706, #f59e0b)' 
                        : 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600',
                      padding: '10px 20px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: sentInvites.includes(rec.userId) || loadingInviteId === rec.userId ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      if (!sentInvites.includes(rec.userId) && loadingInviteId !== rec.userId) {
                        e.currentTarget.style.background = 'linear-gradient(90deg, #2563eb, #7c3aed)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!sentInvites.includes(rec.userId) && loadingInviteId !== rec.userId) {
                        e.currentTarget.style.background = 'linear-gradient(90deg, #3b82f6, #8b5cf6)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    {sentInvites.includes(rec.userId) ? (
                      <>
                        <span>✅</span>
                        Invited
                      </>
                    ) : loadingInviteId === rec.userId ? (
                      <>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid rgba(255, 255, 255, 0.3)',
                          borderTop: '2px solid white',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }}></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <span>📤</span>
                        Send Invitation
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
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