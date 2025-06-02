import { useState } from 'react';
import { Auth } from 'aws-amplify';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // ✅ 建立 navigate 實例

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await Auth.signUp({
        username: email,
        password,
        attributes: {
          email,
          nickname,
        },
      });
      setMessage('註冊成功，請至 Email 收取驗證信');

      // ✅ 導向確認頁，帶上 email
      navigate('/confirm?email=' + encodeURIComponent(email));
    } catch (err) {
      setMessage(err.message || '註冊失敗');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">註冊帳號</h2>
      <form onSubmit={handleRegister} className="space-y-4">
        <input className="w-full border p-2" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full border p-2" type="password" placeholder="密碼" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input className="w-full border p-2" type="text" placeholder="暱稱" value={nickname} onChange={(e) => setNickname(e.target.value)} />
        <button className="bg-blue-500 text-white px-4 py-2 rounded" type="submit">註冊</button>
      </form>
      {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}
    </div>
  );
}
