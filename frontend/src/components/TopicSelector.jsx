import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

const TOPICS = [
  { id: 'JAVA_CORE',     label: 'Java Core',      icon: '☕', desc: 'OOP, JVM, Collections, Concurrency, Generics' },
  { id: 'SPRING_BOOT',   label: 'Spring Boot',    icon: '🍃', desc: 'DI, Auto-config, JPA, REST, Actuator' },
  { id: 'SQL_DB',        label: 'SQL & DB',       icon: '🗄️', desc: 'Queries, Indexes, Transactions, Normalization' },
  { id: 'REST_APIS',     label: 'REST APIs',      icon: '🔌', desc: 'HTTP verbs, Status codes, HATEOAS, Auth' },
  { id: 'SYSTEM_DESIGN', label: 'System Design',  icon: '🏗️', desc: 'Scalability, CAP theorem, Caching, Queues' },
  { id: 'BEHAVIORAL',    label: 'Behavioral',     icon: '🧠', desc: 'STAR method, Leadership, Conflict, Growth' },
  { id: 'DSA',           label: 'DSA',            icon: '📊', desc: 'Arrays, Trees, Graphs, DP, Sorting' },
]

export default function TopicSelector() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ total: 0, completed: 0 })

  useEffect(() => {
    api.getSessions().then(({ data }) => {
      if (!data) return
      setStats({
        total: data.length,
        completed: data.filter(s => s.completed).length
      })
    })
  }, [])

  return (
    <div className="topic-page">
      <div className="topic-hero">
        <h1 className="hero-title">Interview Coach</h1>
        <p className="hero-sub">
          Practice with a senior engineer who gives real, structured feedback.
        </p>
        <div className="stats-bar">
          <div className="stat">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Sessions</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-value">{stats.completed}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-value">7</span>
            <span className="stat-label">Topics</span>
          </div>
        </div>
      </div>

      <div className="topic-grid">
        {TOPICS.map(topic => (
          <button
            key={topic.id}
            className="topic-card"
            onClick={() => navigate(`/practice/questions/${topic.id}`)}
          >
            <span className="topic-icon">{topic.icon}</span>
            <h3 className="topic-name">{topic.label}</h3>
            <p className="topic-desc">{topic.desc}</p>
            <span className="topic-cta">Research Questions →</span>
          </button>
        ))}
      </div>
    </div>
  )
}
