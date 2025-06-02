import { useState, useEffect } from 'react';
import { Storage, Auth } from 'aws-amplify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [nickname, setNickname] = useState('');
  const [major, setMajor] = useState('');
  const [skills, setSkills] = useState([]);
  const [selfIntro, setSelfIntro] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [message, setMessage] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const skillOptions = {
    '程式開發 Programming': ['Python', 'Java', 'C++', 'Go', 'JavaScript', 'TypeScript', 'R'],
    '前端技術 Frontend': ['React', 'Vue', 'Next.js', 'HTML/CSS', 'Bootstrap', 'Tailwind CSS'],
    '後端技術 Backend': ['Node.js', 'Express.js', 'Flask', 'Django', 'Spring Boot'],
    '資料分析與 AI Data & AI': ['SQL', 'NoSQL', 'Pandas', 'NumPy', 'Scikit-learn', 'TensorFlow', 'PyTorch', 'OpenCV', 'Hugging Face', 'LLM 應用 (LLM Apps)'],
    '雲端與開發工具 Cloud & Tools': ['AWS', 'GCP', 'Firebase', 'Docker', 'Git', 'CI/CD'],
    '設計與體驗 Design & UX': ['設計 Design', 'UI/UX', 'Figma', '使用者研究 User Research', 'Prototyping'],
    '商業與產品 Business & Product': ['行銷 Marketing', '商業分析 Business Analysis', '專案管理 Project Management', '產品思維 Product Thinking', '使用者導向設計 User-Centered Design'],
    '軟實力 Soft Skills': ['簡報 Presentation', '溝通 Communication', '團隊合作 Teamwork', '邏輯思考 Logical Thinking', '問題解決 Problem Solving', '時間管理 Time Management', '創意思考 Creative Thinking', '敏捷開發 Agile Development']
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        setNickname(user.attributes.nickname || '');

        const session = await Auth.currentSession();
        const idToken = session.getIdToken().getJwtToken();
        console.log('🔐 idToken:', idToken);
      } catch (err) {
        console.error('❌ 取得使用者資訊失敗', err);
      }
    };
    fetchUserInfo();
  }, []);

  const handleCheckboxChange = (skill) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file?.type === 'application/pdf') {
      setResumeFile(file);
    } else {
      alert('Please upload PDF format resume');
      setResumeFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    
    try {
      const user = await Auth.currentAuthenticatedUser();
      const userId = user.attributes.sub;
      const session = await Auth.currentSession();
      const idToken = session.getIdToken().getJwtToken();

      let resumeUrl = '';
      let resumeFilename = '';

      if (resumeFile) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        resumeFilename = `${userId}/resume_${timestamp}.pdf`;
        await Storage.put(resumeFilename, resumeFile, {
          contentType: 'application/pdf',
          level: 'public'
        });
        resumeUrl = await Storage.get(resumeFilename, { level: 'public' });
      }

      const payload = {
        userId,
        nickname,
        major,
        skills,
        selfIntro,
        resumeUrl
      };

      const API_URL = 'https://7rkf202nmj.execute-api.ap-southeast-2.amazonaws.com/prod/create-profile';

      await axios.post(API_URL, payload, {
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      setMessage('✅ Data saved successfully!');
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err) {
      console.error(err);
      setMessage('❌ Save failed: ' + (err?.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

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

            {/* 個人檔案按鈕 - 當前頁面，顯示為高亮 */}
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
            <span style={{ fontSize: '16px' }}>👤</span>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
              Profile Setup
            </span>
            <span style={{ fontSize: '16px' }}>👤</span>
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
            👤 Edit Personal Profile
          </h1>
          
          <p style={{
            fontSize: '18px',
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Complete your profile to get better teammate recommendations
            
          </p>
        </div>

        {/* 表單容器 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <form onSubmit={handleSubmit}>
            {/* 基本資訊區域 */}
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>ℹ️</span>
                Basic Information
              </h3>
              
              <div style={{ 
                display: 'grid', 
                gap: '20px', 
                gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(2, 1fr)',
                marginBottom: '20px'
              }}>
                <input 
                  style={{
                    width: '100%',
                    border: '2px solid #e5e7eb',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    fontSize: '16px',
                    transition: 'all 0.3s ease',
                    background: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: '500',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Nickname" 
                  value={nickname} 
                  onChange={(e) => setNickname(e.target.value)}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                
                <input 
                  style={{
                    width: '100%',
                    border: '2px solid #e5e7eb',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    fontSize: '16px',
                    transition: 'all 0.3s ease',
                    background: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: '500',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Major" 
                  value={major} 
                  onChange={(e) => setMajor(e.target.value)}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              
              <textarea 
                style={{
                  width: '100%',
                  border: '2px solid #e5e7eb',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  fontSize: '16px',
                  minHeight: '120px',
                  resize: 'vertical',
                  transition: 'all 0.3s ease',
                  background: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: '500',
                  boxSizing: 'border-box'
                }}
                placeholder="Self Introduction" 
                value={selfIntro} 
                onChange={(e) => setSelfIntro(e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* 技能選擇區域 */}
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>⚡</span>
                Your Skills（Multiple Selection）
                {skills.length > 0 && (
                  <span style={{
                    background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                    color: 'white',
                    fontSize: '12px',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontWeight: '500'
                  }}>
                    {skills.length} Selected
                  </span>
                )}
              </h3>
              
              {Object.entries(skillOptions).map(([category, options]) => (
                <div key={category} style={{
                  marginBottom: '24px',
                  background: 'rgba(255, 255, 255, 0.6)',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}>
                  <button
                    type="button"
                    onClick={() => toggleCategory(category)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '20px 24px',
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
                      padding: '24px',
                      background: 'rgba(255, 255, 255, 0.4)',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                      gap: '12px'
                    }}>
                      {options.map((skill) => {
                        const selected = skills.includes(skill);
                        return (
                          <label key={skill} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            cursor: 'pointer',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            transition: 'all 0.3s ease',
                            background: selected ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                            border: selected ? '2px solid #3b82f6' : '2px solid transparent'
                          }}
                          onMouseEnter={(e) => {
                            if (!selected) {
                              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!selected) {
                              e.currentTarget.style.background = 'transparent';
                            }
                          }}>
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => handleCheckboxChange(skill)}
                              style={{
                                width: '18px',
                                height: '18px',
                                accentColor: '#3b82f6'
                              }}
                            />
                            <span style={{ 
                              fontSize: '14px', 
                              color: '#374151', 
                              fontWeight: selected ? '600' : '500'
                            }}>
                              {selected ? '✅ ' : ''}{skill}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 履歷上傳區域 */}
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>📄</span>
                Upload Resume（PDF）
              </h3>
              
              <div style={{
                background: 'rgba(255, 255, 255, 0.6)',
                border: '2px dashed #d1d5db',
                borderRadius: '20px',
                padding: '32px',
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  fontSize: '48px',
                  marginBottom: '16px',
                  color: '#6b7280'
                }}>📎</div>
                <input 
                  type="file" 
                  accept="application/pdf" 
                  onChange={handleFileChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    borderRadius: '12px',
                    border: '1px solid #d1d5db',
                    background: 'rgba(255, 255, 255, 0.8)'
                  }}
                />
                {resumeFile && (
                  <p style={{ 
                    marginTop: '16px', 
                    color: '#059669', 
                    fontSize: '16px',
                    fontWeight: '500'
                  }}>
                    ✅ 已選擇檔案：{resumeFile.name}
                    <br />
                    <span style={{ fontSize: '14px' }}>
                      File selected: {resumeFile.name}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* 提交按鈕 */}
            <button 
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? 'linear-gradient(90deg, #9ca3af, #9ca3af)' : 'linear-gradient(90deg, #059669, #10b981)',
                color: 'white',
                fontSize: '18px',
                fontWeight: '600',
                padding: '20px 32px',
                borderRadius: '16px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = 'linear-gradient(90deg, #047857, #059669)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(5, 150, 105, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = 'linear-gradient(90deg, #059669, #10b981)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Processing...
                </>
              ) : (
                <>
                  Save & Continue
                  <span>➡️</span>
                </>
              )}
            </button>
          </form>

          {/* 訊息顯示 */}
          {message && (
            <div style={{
              marginTop: '32px',
              padding: '20px',
              borderRadius: '16px',
              textAlign: 'center',
              fontSize: '16px',
              fontWeight: '500',
              background: message.startsWith('✅') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: message.startsWith('✅') ? '#059669' : '#dc2626',
              border: `1px solid ${message.startsWith('✅') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
            }}>
              {message}
            </div>
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
              🚀
            </div>
            <h3 style={{
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '8px',
              fontSize: '18px'
            }}>
              Ready to Find Your Team?
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: '#6b7280',
              lineHeight: '1.5'
            }}>
              After saving your profile, you can start browsing competitions and finding teammates
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

        @media (max-width: 640px) {
          .hidden-mobile {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}