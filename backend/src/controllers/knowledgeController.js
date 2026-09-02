const KnowledgeDocument = require('../models/KnowledgeDocument');

exports.getKnowledgeDocuments = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const query = { isActive: true };
    
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const docs = await KnowledgeDocument.find(query).sort({ title: 1 });
    res.status(200).json({ success: true, count: docs.length, documents: docs });
  } catch (error) {
    next(error);
  }
};

exports.createKnowledgeDocument = async (req, res, next) => {
  try {
    const { title, category, content, summary, tags } = req.body;

    if (!title || !category || !content) {
      return res.status(400).json({ success: false, message: 'Title, category, and content are required' });
    }

    // Simple chunking logic (approx 300 chars per chunk)
    const rawChunks = content.match(/[\s\S]{1,300}/g) || [content];
    const chunks = rawChunks.map((chunkText, idx) => ({
      chunkIndex: idx,
      text: chunkText,
      embedding: [], // Embeddings generated on indexing
    }));

    const doc = await KnowledgeDocument.create({
      title,
      category,
      content,
      summary: summary || (content.substring(0, 150) + '...'),
      chunks,
      tags: tags || [],
    });

    res.status(201).json({ success: true, document: doc });
  } catch (error) {
    next(error);
  }
};

exports.deleteKnowledgeDocument = async (req, res, next) => {
  try {
    await KnowledgeDocument.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Document deleted' });
  } catch (error) {
    next(error);
  }
};
