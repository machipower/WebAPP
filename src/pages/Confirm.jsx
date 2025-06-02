import { useState } from 'react';
import { Auth } from 'aws-amplify';
import { useSearchParams, useNavigate } from 'react-router-dom';  // ✅ 加入 useNavigate

export default function Confirm() {
  const [searchParams] = useSearchParams();
  const defaultEmail = searchParams.get('email') || '';
  const [email, setEmail] = useState(defaultEmail);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();  // ✅ 建立導向函式

  const handleConfirm = async (e) => {
    e.preventDefault();
    try {
      await Auth.confirmSignUp(email, code);
      setMessage('✅ 驗證成功，請前往登入');
    } catch (err) {
      setMessage(err.message || '驗證失敗');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">驗證帳號</h2>
      <form onSubmit={handleConfirm} className="space-y-4">
        <input
          className="w-full border p-2"
          type="email"
          placeholder="註冊用的 Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full border p-2"
          type="text"
          placeholder="輸入收到的驗證碼"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded" type="submit">
          確認驗證
        </button>
      </form>

      {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}

      {/* ✅ 新增登入按鈕 */}
      <div className="mt-6 text-center">
        <button
          onClick={() => navigate('/login')}
          className="text-blue-500 underline hover:text-blue-700"
        >
          前往登入
        </button>
      </div>
    </div>
  );
}
