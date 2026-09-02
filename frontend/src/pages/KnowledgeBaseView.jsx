import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Plus, FileText, CheckCircle, Database } from 'lucide-react';
import api from '../services/api';

export default function KnowledgeBaseView() {
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // New Doc Form Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Payment');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;

      const res = await api.get('/knowledge', { params });
      if (res.data.success) {
        setDocuments(res.data.documents);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [search, categoryFilter]);

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/knowledge', {
        title,
        category,
        content,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      if (res.data.success) {
        setIsModalOpen(false);
        setTitle('');
        setContent('');
        setTags('');
        await fetchDocs();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating document');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            Support<span className="text-purple-600">IQ</span> Knowledge Intelligence (RAG Grounding)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Grounded policy documents indexed for vector similarity search and Gemini resolution reasoning
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Policy Document</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search policy titles, content, or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-600 font-medium"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-600"
        >
          <option value="">All Categories</option>
          <option value="Payment">Payment</option>
          <option value="Technical">Technical</option>
          <option value="Delivery">Delivery</option>
          <option value="Account">Account</option>
          <option value="Security">Security</option>
        </select>
      </div>

      {/* Document Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500">Loading vector index...</div>
      ) : documents.length === 0 ? (
        <div className="py-16 text-center text-slate-500">No policy documents found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {documents.map((doc) => (
            <div key={doc._id} className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-purple-600 shadow-sm space-y-3 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <h3 className="font-bold text-slate-900 text-sm">{doc.title}</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-purple-50 border border-purple-200 text-purple-700 text-[10px] font-bold uppercase">
                  {doc.category}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono text-[11px] whitespace-pre-wrap">
                {doc.content}
              </p>

              {doc.tags && doc.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {doc.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded border border-slate-200">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Upload Policy Document for RAG Vector Indexing</h3>

            <form onSubmit={handleUpload} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chargeback & Fraud SLA"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 font-medium focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 font-medium focus:outline-none focus:border-purple-600"
                >
                  <option value="Payment">Payment</option>
                  <option value="Technical">Technical</option>
                  <option value="Delivery">Delivery</option>
                  <option value="Account">Account</option>
                  <option value="Security">Security</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Full Document SOP Content</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Write full company policy instructions..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Comma-separated Tags</label>
                <input
                  type="text"
                  placeholder="e.g. payment, refund, double charge"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 font-medium focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Index & Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
