'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import QuestionCard from '@/components/QuestionCard';
import styles from './dashboard.module.css';

interface Record {
  id: string;
  status: string;
  question: {
    contentText: string;
    source: string;
    tags: string[];
  };
  lastReviewedAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    if (role === 'TEACHER' || role === 'ADMIN') {
      router.push('/analytics');
      return;
    }

    const fetchRecords = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      try {
        const response = await fetch(`${apiUrl}/api/records`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.status === 401) {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch records');
        }
        const data = await response.json();
        setRecords(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    router.push('/login');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>我的錯題本</h1>
        <div className={styles.headerButtons}>
          <Link href="/upload" className={styles.uploadButton}>
            新增錯題
          </Link>
          <button onClick={handleLogout} className={styles.logoutButton}>
            登出
          </button>
        </div>
      </header>

      {loading && <p>載入中...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && (
        <div className={styles.recordList}>
          {records.length === 0 ? (
            <p>目前還沒有錯題紀錄，開始上傳吧！</p>
          ) : (
            records.map((record) => (
              <QuestionCard
                key={record.id}
                contentText={record.question?.contentText || '無題目內容'}
                source={record.question?.source || '未知'}
                tags={record.question?.tags || []}
                createdAt={record.lastReviewedAt || ''}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
