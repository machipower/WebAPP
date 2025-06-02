import { useState } from 'react';
import { Auth } from 'aws-amplify';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      await Auth.signUp({
        username: email,
        password,
        attributes: {
          email,
          nickname,
        },
      });
      setMessage('✅ 註冊成功，請至 Email 收取驗證信 / Registration successful, please check your email for verification');

      // 導向確認頁，帶上 email
      setTimeout(() => {
        navigate('/confirm?email=' + encodeURIComponent(email));
      }, 1500);
    } catch (err) {
      setMessage('❌ ' + (err.message || '註冊失敗 / Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #eff6ff 0%, #f3e8ff 50%, #fdf2f8 100%)',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
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
          top: '20%',
          left: '10%',
          width: '120px',
          height: '120px',
          background: 'rgba(147, 197, 253, 0.2)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: '160px',
          height: '160px',
          background: 'rgba(196, 181, 253, 0.15)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '60%',
          left: '70%',
          width: '100px',
          height: '100px',
          background: 'rgba(251, 207, 232, 0.25)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }}></div>
      </div>

      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '400px'
      }}>
        {/* 頁面標題 */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
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
            <span style={{ fontSize: '16px' }}>👋</span>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Join MachiPower </span>
            <span style={{ fontSize: '16px' }}>👋</span>
          </div>
          
          <h2 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '8px',
            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Create Account
          </h2>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            註冊帳號
          </p>
        </div>

        {/* 註冊表單 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                📧 電子郵件 / Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '90%',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '16px',
                  transition: 'all 0.3s ease',
                  background: 'rgba(255, 255, 255, 0.9)'
                }}
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

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                🔒 密碼 / Password
              </label>
              <input
                type="password"
                placeholder="Set your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '90%',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '16px',
                  transition: 'all 0.3s ease',
                  background: 'rgba(255, 255, 255, 0.9)'
                }}
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

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                👤 暱稱 / Nickname
              </label>
              <input
                type="text"
                placeholder="Enter your nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                style={{
                  width: '90%',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '16px',
                  transition: 'all 0.3s ease',
                  background: 'rgba(255, 255, 255, 0.9)'
                }}
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

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? 'linear-gradient(90deg, #9ca3af, #9ca3af)' : 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                padding: '14px 28px',
                borderRadius: '12px',
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
                  e.currentTarget.style.background = 'linear-gradient(90deg, #2563eb, #7c3aed)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = 'linear-gradient(90deg, #3b82f6, #8b5cf6)';
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
                  註冊中... / Registering...
                </>
              ) : (
                <>
                  註冊 / Register
                  <span>🚀</span>
                </>
              )}
            </button>
          </form>

          {/* 訊息顯示 */}
          {message && (
            <div style={{
              marginTop: '20px',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
              textAlign: 'center',
              background: message.startsWith('✅') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: message.startsWith('✅') ? '#059669' : '#dc2626',
              border: `1px solid ${message.startsWith('✅') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
            }}>
              {message}
            </div>
          )}

          {/* 登入連結 */}
          <div style={{
            marginTop: '24px',
            textAlign: 'center',
            paddingTop: '20px',
            borderTop: '1px solid rgba(229, 231, 235, 0.5)'
          }}>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>
              已經有帳號了嗎？ / Already have an account?
            </p>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#3b82f6',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#2563eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#3b82f6';
              }}
            >
              前往登入 / Go to Login
            </button>
          </div>
        </div>

        {/* 特色說明 */}
        <div style={{
          marginTop: '24px',
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(8px)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '12px',
            textAlign: 'center'
          }}>
            🌟 加入我們的競賽平台 / Join Our Competition Platform
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '12px',
            fontSize: '12px',
            color: '#6b7280'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>🏆</div>
              <span>參加競賽<br/>Join Contests</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>👥</div>
              <span>尋找隊友<br/>Find Teammates</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>🎯</div>
              <span>技能配對<br/>Skill Matching</span>
            </div>
          </div>
        </div>
      </div>

      {/* CSS 動畫 */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}