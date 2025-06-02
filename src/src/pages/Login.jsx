import { useState } from 'react';
import { Auth } from 'aws-amplify';
import { Link } from 'react-router-dom';  // ✅ 引入 Link 元件

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await Auth.signIn(email, password);
      setMessage('登入成功');
      window.location.href = '/profile'; // ✅ 登入後導向個人頁
    } catch (err) {
      setMessage(err.message || '登入失敗');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">登入</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <input className="w-full border p-2" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full border p-2" type="password" placeholder="密碼" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="bg-green-500 text-white px-4 py-2 rounded" type="submit">登入</button>
      </form>
      
      {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}

      {/* ✅ 新增註冊導向連結 */}
      <div className="mt-6 text-center">
        <p className="text-sm">
          還沒有帳號？
          <Link to="/register" className="text-blue-500 hover:underline ml-1">
            點此註冊
          </Link>
        </p>
      </div>
    </div>
  );
}
