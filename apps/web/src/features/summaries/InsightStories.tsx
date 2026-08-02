import type { MonthlyInsightStory } from "../../lib/api/types";

export function InsightStories({ stories, onSelectCategory }: { stories: MonthlyInsightStory[]; onSelectCategory: (categoryId: string) => void }) {
  if (!stories.length) return <p className="muted">Monthly stories will appear after the dashboard has spending data.</p>;
  return (
    <div className="insight-list">
      {stories.map((story) => (
        <article key={story.id} className={`insight-card insight-card--${story.severity}`}>
          <div>
            <strong>{story.title}</strong>
            <p>{story.body}</p>
          </div>
          {story.categoryId ? <button type="button" onClick={() => onSelectCategory(story.categoryId!)}>View records</button> : null}
        </article>
      ))}
    </div>
  );
}
