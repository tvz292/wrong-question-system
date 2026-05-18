'use client';

import { useEffect, useState } from 'react';

interface Question {
  id: number;
  content: string;
  tags: string[];
}

export default function PapersPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch('/api/questions');
        const data: Question[] = await response.json();
        setQuestions(data);
      } catch (error) {
        console.error('Failed to fetch questions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, []);

  const toggleSelect = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleGenerate = () => {
    console.log('Generating paper with question IDs:', Array.from(selectedIds));
    alert(`已選擇 ${selectedIds.size} 個題目生成卷類，請查看主控台。`);
  };

  if (loading) return <div style={{ padding: '20px' }}>讀取中...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>卷類生成</h1>
      <p style={{ margin: '10px 0' }}>勾選題目以生成複習卷</p>
      
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={handleGenerate}
          disabled={selectedIds.size === 0}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: selectedIds.size === 0 ? '#ccc' : '#0070f3', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: selectedIds.size === 0 ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          生成複習卷 ({selectedIds.size})
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {questions.length === 0 ? (
          <p>目前沒有題目可供選擇。</p>
        ) : (
          questions.map((q) => (
            <div 
              key={q.id} 
              style={{ 
                padding: '15px', 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'flex-start',
                gap: '15px',
                backgroundColor: selectedIds.has(q.id) ? '#f0f7ff' : 'white',
                cursor: 'pointer'
              }}
              onClick={() => toggleSelect(q.id)}
            >
              <input 
                type="checkbox" 
                checked={selectedIds.has(q.id)} 
                onChange={() => {}} // Handle change via div click
                style={{ marginTop: '5px' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: '10px', fontSize: '1.1rem' }}>{q.content}</div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {q.tags.map((tag, idx) => (
                    <span 
                      key={idx} 
                      style={{ 
                        backgroundColor: '#e0e0e0', 
                        padding: '2px 8px', 
                        borderRadius: '12px', 
                        fontSize: '0.8rem' 
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
