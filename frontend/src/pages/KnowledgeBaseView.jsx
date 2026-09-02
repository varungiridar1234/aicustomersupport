import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Plus, FileText, Database } from 'lucide-react';
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
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-industrial-shadow/40">
        <div>
          <h1 className="text-xl font-bold text-industrial-dark tracking-tight font-mono uppercase flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-industrial-orange" />
            SUPPORT<span className="text-industrial-orange">IQ</span> KNOWLEDGE INTELLIGENCE (RAG INDEX)
          </h1>
          <p className="text-xs font-mono text-industrial-label mt-0.5">
            GROUNDED POLICY DOCUMENTS INDEXED FOR VECTOR SIMILARITY SEARCH & GEMINI REASONING
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="industrial-btn-primary px-4 py-2 text-xs font-mono flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>UPLOAD POLICY DOCUMENT</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="industrial-card corner-screws p-4 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-industrial-label" />
          <input
            type="text"
            placeholder="Search policy titles, content, or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full industrial-well pl-10 pr-4 py-2 text-xs text-industrial-dark placeholder-industrial-label focus:outline-none font-mono"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="industrial-well px-3 py-2 text-xs font-mono font-bold text-industrial-dark focus:outline-none"
        >
          <option value="">ALL CATEGORIES</option>
          <option value="Payment">PAYMENT</option>
          <option value="Technical">TECHNICAL</option>
          <option value="Delivery">DELIVERY</option>
          <option value="Account">ACCOUNT</option>
          <option value="Security">SECURITY</option>
        </select>
      </div>

      {/* Document Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs font-mono text-industrial-label">LOADING VECTOR INDEX...</div>
      ) : documents.length === 0 ? (
        <div className="py-16 text-center text-xs font-mono text-industrial-label">NO POLICY DOCUMENTS FOUND IN INDEX.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {documents.map((doc) => (
            <div key={doc._id} className="industrial-card corner-screws p-5 space-y-3 border-l-4 border-l-industrial-orange">
              <div className="flex items-center justify-between pl-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-industrial-orange" />
                  <h3 className="font-bold text-industrial-dark text-sm font-mono">{doc.title}</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-industrial-recessed text-industrial-dark font-mono text-[10px] font-bold uppercase pr-4">
                  {doc.category}
                </span>
              </div>

              <p className="industrial-well p-3.5 text-xs text-industrial-dark leading-relaxed font-sans whitespace-pre-wrap">
                {doc.content}
              </p>

              {doc.tags && doc.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1 font-mono">
                  {doc.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-0.5 bg-industrial-recessed text-industrial-dark text-[10px] font-bold rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="industrial-card corner-screws max-w-lg w-full p-6 shadow-floating space-y-4">
            <h3 className="text-base font-bold text-industrial-dark font-mono uppercase pl-4">
              UPLOAD POLICY DOCUMENT FOR VECTOR INDEXING
            </h3>

            <form onSubmit={handleUpload} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-industrial-dark font-bold block mb-1">DOCUMENT TITLE</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chargeback & Fraud SLA"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full industrial-well p-2.5 text-industrial-dark font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="text-industrial-dark font-bold block mb-1">CATEGORY</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full industrial-well p-2.5 text-industrial-dark font-mono focus:outline-none"
                >
                  <option value="Payment">Payment</option>
                  <option value="Technical">Technical</option>
                  <option value="Delivery">Delivery</option>
                  <option value="Account">Account</option>
                  <option value="Security">Security</option>
                </select>
              </div>

              <div>
                <label className="text-industrial-dark font-bold block mb-1">FULL DOCUMENT SOP CONTENT</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Write full company policy instructions..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full industrial-well p-2.5 text-industrial-dark font-sans text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-industrial-dark font-bold block mb-1">TAGS (COMMA SEPARATED)</label>
                <input
                  type="text"
                  placeholder="e.g. payment, refund, double charge"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full industrial-well p-2.5 text-industrial-dark font-mono focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="industrial-btn-secondary px-4 py-2 text-xs font-mono"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="industrial-btn-primary px-4 py-2 text-xs font-mono"
                >
                  INDEX & SAVE POLICY
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
