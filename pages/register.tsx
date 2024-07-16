import { useState } from 'react';
import { useRouter } from 'next/router';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { useAuthContext } from '../contexts/AuthContext';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null); // エラーメッセージの状態を追加
  const { user } = useAuthContext();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // 新しい試行の前にエラーをリセット
    try {
      const auth = getAuth();
      await createUserWithEmailAndPassword(auth, email, password);
      await signOut(auth); // 登録後にログアウト
      router.push('/login'); // ログアウト後のリダイレクト先
    } catch (error: any) {
      console.error(error);
      setError(error.message); // エラーメッセージを設定
    }
  };

  if (user) {
    router.push('/'); // 既にログインしている場合はリダイレクト
    return null;
  }

  return (
    <div>
      <section className='register'>
        <h1>ユーザー登録画面</h1>
        <form onSubmit={handleSubmit} className='register-form'>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="メールアドレス"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワード"
            required
          />
          <button type="submit">登録</button>
          {error && <p style={{ color: 'red' }}>{error}</p>} {/* エラーメッセージを表示 */}
        </form>
      </section>
    </div>
  );
};

export default RegisterPage;
