import { useState } from 'react';
import { Auth } from 'aws-amplify';
import { Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      await Auth.signIn(email, password);
      setMessage('✅ Login successful! Redirecting...');
      setTimeout(() => {
        window.location.href = '/profile';
      }, 1000);
    } catch (err) {
      setMessage('❌ ' + (err.message || 'Login failed'));
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
          top: '15%',
          right: '12%',
          width: '140px',
          height: '140px',
          background: 'rgba(147, 197, 253, 0.2)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '25%',
          left: '8%',
          width: '180px',
          height: '180px',
          background: 'rgba(196, 181, 253, 0.15)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '45%',
          left: '75%',
          width: '110px',
          height: '110px',
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
            <span style={{ fontSize: '16px' }}>🔐</span>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Welcome Back to MachiPower</span>
          </div>
          
          <h2 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '8px',
            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Sign In
          </h2>
          Please sign in to continue
        </div>

        {/* 登入表單 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                📧 Email
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

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                🔒 Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
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

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? 'linear-gradient(90deg, #9ca3af, #9ca3af)' : 'linear-gradient(90deg, #059669, #10b981)',
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
                  登入中... / Signing In...
                </>
              ) : (
                <>
                <span>🚀</span>
                  Sign In
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

          {/* 註冊連結 */}
          <div style={{
            marginTop: '24px',
            textAlign: 'center',
            paddingTop: '20px',
            borderTop: '1px solid rgba(229, 231, 235, 0.5)'
          }}>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>
              Don't have an account?
            </p>
            <Link
              to="/register"
              style={{
                color: '#3b82f6',
                fontSize: '14px',
                fontWeight: '600',
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#2563eb';
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#3b82f6';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Register Here
            </Link>
          </div>

          {/* 忘記密碼連結 */}
          <div style={{
            marginTop: '16px',
            textAlign: 'center'
          }}>
            <button
              style={{
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                fontSize: '12px',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#6b7280';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#9ca3af';
              }}
            >
              Forgot Password?
            </button>
          </div>
        </div>

        {/* 快速登入提示 */}
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
            🎯 Experience After Login
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '12px',
            fontSize: '12px',
            color: '#6b7280'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>👤</div>
              <span>Profile</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>🎯</div>
              <span>Smart Match</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>📬</div>
              <span>Invitations</span>
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