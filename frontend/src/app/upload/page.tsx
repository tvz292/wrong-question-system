'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './upload.module.css';

export default function UploadPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    contentText: '',
    source: '考卷',
    tags: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const tagsArray = formData.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag !== '');

    try {
      const response = await fetch('http://localhost:3001/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          contentText: formData.contentText,
          source: formData.source,
          tags: tagsArray,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload question');
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/dashboard" className={styles.backButton}>
          ← 返回
        </Link>
        <h1>新增錯題</h1>
      </header>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="contentText">題目內容</label>
          <textarea
            id="contentText"
            name="contentText"
            value={formData.contentText}
            onChange={handleChange}
            required
            placeholder="請輸入題目文字內容..."
            rows={6}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="source">來源</label>
          <select
            id="source"
            name="source"
            value={formData.source}
            onChange={handleChange}
          >
            <option value="考卷">考卷</option>
            <option value="練習本">練習本</option>
            <option value="課本">課本</option>
            <option value="其他">其他</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="tags">標籤 (以逗號分隔)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="例如：數學, 幾何, 難題"
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" disabled={submitting} className={styles.submitButton}>
          {submitting ? '提交中...' : '提交'}
        </button>
      </form>
    </div>
  );
}
