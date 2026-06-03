import { useState, type KeyboardEvent } from 'react';

const MAX_TOPICS = 12;

export function useTopics() {
  const [topics, setTopics] = useState<string[]>([]);
  const [newTopic, setNewTopic] = useState('');

  const addTopic = (topic: string) => {
    const trimmed = topic.trim();
    if (trimmed && !topics.includes(trimmed) && topics.length < MAX_TOPICS) {
      setTopics((prev) => [...prev, trimmed]);
    }
  };

  const removeTopic = (topic: string) => {
    setTopics((prev) => prev.filter((t) => t !== topic));
  };

  const handleAddNewTopic = () => {
    if (newTopic.trim()) {
      addTopic(newTopic);
      setNewTopic('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddNewTopic();
    }
  };

  const reset = () => {
    setTopics([]);
    setNewTopic('');
  };

  return {
    topics,
    newTopic,
    setNewTopic,
    removeTopic,
    handleAddNewTopic,
    handleKeyPress,
    reset,
  };
}
