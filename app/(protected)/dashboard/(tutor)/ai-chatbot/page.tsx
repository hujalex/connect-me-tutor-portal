'use client';

import { useState } from 'react';
import { Send, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function ChatInterface() {
  const [input, setInput] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">ConnectMe Chatbot</h2>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-700">
              How can I help you?
            </h3>
            <p className="text-sm text-gray-500">
              Ask me anything about your tutoring or learning materials.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 p-4 flex-shrink-0">
        <form onSubmit={handleSendMessage} className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Message AI Chatbot..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!input.trim()}
              size="icon"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-400">
            AI Chatbot may produce inaccurate information
          </p>
        </form>
      </div>
    </div>
  );
}

export default function AIChatbotPage() {
  return (
    <div className="h-screen flex flex-col">
      <div className="p-8 pb-4">
        <h1 className="text-3xl font-bold mb-6">AI Chatbot</h1>
      </div>
      <div className="flex px-8 pb-32">
        <div className="flex-grow max-h-[65vh]">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}
