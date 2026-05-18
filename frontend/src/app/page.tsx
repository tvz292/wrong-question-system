import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: '1rem', gap: '2rem' }}>
      <header>
        <h1>錯題管理系統</h1>
      </header>
      <main style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p>歡迎使用錯題管理系統！</p>
        <p>開始整理你的學習筆記吧。</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/dashboard" style={{ background: '#0070f3', color: 'white', padding: '1rem 2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
            進入我的錯題本
          </Link>
          <Link href="/analytics" style={{ background: '#10b981', color: 'white', padding: '1rem 2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
            分析看板
          </Link>
          <Link href="/papers" style={{ background: '#f59e0b', color: 'white', padding: '1rem 2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
            卷類生成
          </Link>
        </div>
      </main>
    </div>
  );
}
