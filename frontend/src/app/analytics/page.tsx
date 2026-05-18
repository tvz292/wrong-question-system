'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Question {
  id: number;
  tags: string[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch('/api/questions');
        const questions: Question[] = await response.json();
        
        const tagCounts: { [key: string]: number } = {};
        questions.forEach((q) => {
          q.tags.forEach((tag) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        });
        
        setData(tagCounts);
      } catch (error) {
        console.error('Failed to fetch questions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, []);

  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        label: '知識點分佈',
        data: Object.values(data),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '知識點分佈分析',
      },
    },
  };

  if (loading) return <div style={{ padding: '20px' }}>讀取中...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>分析看板</h1>
      <div style={{ marginTop: '30px', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
