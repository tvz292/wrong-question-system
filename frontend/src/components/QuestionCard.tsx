import styles from './QuestionCard.module.css';

interface QuestionCardProps {
  contentText: string;
  source: string;
  tags: string[];
  createdAt: string;
}

export default function QuestionCard({ contentText, source, tags, createdAt }: QuestionCardProps) {
  return (
    <div className={styles.recordCard}>
      <div className={styles.recordHeader}>
        <span className={styles.source}>{source}</span>
        <span className={styles.date}>
          {new Date(createdAt).toLocaleDateString()}
        </span>
      </div>
      <p className={styles.contentText}>{contentText}</p>
      <div className={styles.tags}>
        {tags.map((tag) => (
          <span key={tag} className={styles.tag}>
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}
