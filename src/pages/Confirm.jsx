import { useState } from 'react';
import { Auth } from 'aws-amplify';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function Confirm() {
  const [searchParams] = useSearchParams();
  const defaultEmail = searchParams.get('email') || '';
  const [email, setEmail] = useState(defaultEmail);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleConfirm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      await Auth.confirmSignUp(email, code);
      setMessage('✅ Verification successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setMessage('❌ ' + (err.message || 'Verification failed'));
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
          top: '100px',
          left: '50px',
          width: '150px',
          height: '150px',
          background: 'rgba(147, 197, 253, 0.2)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '100px',
          right: '80px',
          width: '200px',
          height: '200px',
          background: 'rgba(196, 181, 253, 0.15)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '20%',
          width: '100px',
          height: '100px',
          background: 'rgba(251, 207, 232, 0.25)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }}></div>
      </div>

      {/* 主要內容容器 */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '480px'
      }}>
        {/* Logo 和標題區域 */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '32px'
          }}>
            <div style={{
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
              borderRadius: '16px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '24px' }}>🏆</span>
            </div>
            <div>
              <h1 style={{
                fontSize: '24px',
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
                fontSize: '14px',
                color: '#6b7280',
                margin: 0
              }}>
                TeamMate Match Platform
              </p>
            </div>
          </div>

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
            <span style={{ fontSize: '16px' }}>✉️</span>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
              Account Verification
            </span>
          </div>

          <h2 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '8px',
            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Verify Account
          </h2>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '16px',
            lineHeight: '1.5'
          }}>
            Enter your email and verification code to activate your account
          </p>
        </div>

        {/* 表單容器 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <form onSubmit={handleConfirm}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                📧 Email Address
              </label>
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
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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

            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                🔐 Verification Code
              </label>
              <input
                style={{
                  width: '100%',
                  border: '2px solid #e5e7eb',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  fontSize: '18px',
                  letterSpacing: '0.1em',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  background: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: '600',
                  boxSizing: 'border-box'
                }}
                type="text"
                placeholder="Enter verification code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
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
              disabled={loading || !email || !code}
              style={{
                width: '100%',
                background: loading || !email || !code 
                  ? 'linear-gradient(90deg, #9ca3af, #9ca3af)' 
                  : 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                color: 'white',
                fontSize: '18px',
                fontWeight: '600',
                padding: '16px 32px',
                borderRadius: '16px',
                border: 'none',
                cursor: loading || !email || !code ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '24px'
              }}
              onMouseEnter={(e) => {
                if (!loading && email && code) {
                  e.currentTarget.style.background = 'linear-gradient(90deg, #2563eb, #7c3aed)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && email && code) {
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
                  Verifying...
                </>
              ) : (
                <>
                  Confirm Verification
                  <span>✅</span>
                </>
              )}
            </button>

            {/* 訊息顯示 */}
            {message && (
              <div style={{
                padding: '16px 20px',
                borderRadius: '16px',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: '500',
                background: message.startsWith('✅') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: message.startsWith('✅') ? '#059669' : '#dc2626',
                border: `1px solid ${message.startsWith('✅') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                marginBottom: '16px'
              }}>
                {message}
              </div>
            )}

            {/* 登入連結 */}
            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => navigate('/login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3b82f6',
                  fontSize: '14px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontWeight: '500',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#3b82f6';
                }}
              >
                Go to Login
              </button>
            </div>
          </form>
        </div>

        {/* 底部說明 */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '32px' 
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(8px)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ 
              fontSize: '24px', 
              marginBottom: '8px' 
            }}>
              📱
            </div>
            <p style={{ 
              fontSize: '12px', 
              color: '#6b7280',
              lineHeight: '1.4',
              margin: 0
            }}>
              Check your email inbox and spam folder for the verification code
            </p>
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