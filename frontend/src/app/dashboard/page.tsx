'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import QuestionCard from '@/components/QuestionCard';
import styles from './dashboard.module.css';

interface Record {
  id: string;
  contentText: string;
  source: string;
  tags: string[];
  createdAt: string;
}

export default function Dashboard() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock Auth: Ensure a token exists
    if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
      localStorage.setItem('token', 'mock-token-123');
    }

    const fetchRecords = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/records', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
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
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>我的錯題本</h1>
        <Link href="/upload" className={styles.uploadButton}>
          新增錯題
        </Link>
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
                contentText={record.contentText}
                source={record.source}
                tags={record.tags}
                createdAt={record.createdAt}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
