'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Brain, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface Topic {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  keywords: string;
  createdAt: string;
  updatedAt: string;
  topic: Topic;
}

export default function FAQsManagement() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    keywords: '',
    topicId: ''
  });
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      fetchFAQs();
      fetchTopics();
    }
  }, [isClient]);

  const fetchFAQs = async () => {
    if (!isClient) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      let url = '/api/faqs';
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (selectedTopic) params.append('topicId', selectedTopic);
      
      if (params.toString()) url += '?' + params.toString();

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFaqs(data);
      }
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load FAQs',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTopics = async () => {
    if (!isClient) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/topics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTopics(data);
      }
    } catch (error) {
      console.error('Failed to fetch topics:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      const url = editingFAQ ? '/api/faqs' : '/api/faqs';
      const method = editingFAQ ? 'PUT' : 'POST';

      // Parse keywords and ensure they're stored as JSON string
      const keywordsArray = formData.keywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);
      
      const payload = {
        ...formData,
        keywords: JSON.stringify(keywordsArray),
        ...(editingFAQ && { id: editingFAQ.id })
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: editingFAQ ? 'FAQ updated successfully' : 'FAQ created successfully'
        });
        setIsDialogOpen(false);
        resetForm();
        fetchFAQs();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to save FAQ',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Failed to save FAQ:', error);
      toast({
        title: 'Error',
        description: 'Failed to save FAQ',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (faq: FAQ) => {
    setEditingFAQ(faq);
    const keywordsArray = JSON.parse(faq.keywords || '[]');
    setFormData({
      question: faq.question,
      answer: faq.answer,
      keywords: keywordsArray.join(', '),
      topicId: faq.topic.id
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (faqId: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) {
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/faqs?id=${faqId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'FAQ deleted successfully'
        });
        fetchFAQs();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to delete FAQ',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Failed to delete FAQ:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete FAQ',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEditingFAQ(null);
    setFormData({
      question: '',
      answer: '',
      keywords: '',
      topicId: ''
    });
  };

  const handleSearch = () => {
    fetchFAQs();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTopic('');
    setTimeout(fetchFAQs, 100);
  };

  const filteredFAQs = faqs; // Filtering is now done on the server side

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading FAQs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-primary font-bold">FAQs Management</h2>
          <p className="text-muted-foreground">
            Create and manage frequently asked questions for each topic
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingFAQ ? 'Edit FAQ' : 'Add New FAQ'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question">Question *</Label>
                <Textarea
                  id="question"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="e.g., What is a programming language?"
                  rows={2}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="answer">Answer *</Label>
                <Textarea
                  id="answer"
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Provide a detailed answer to the question..."
                  rows={6}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic *</Label>
                  <Select
                    value={formData.topicId}
                    onValueChange={(value) => setFormData({ ...formData, topicId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {topics.map((topic) => (
                        <SelectItem key={topic.id} value={topic.id}>
                          {topic.icon && <span className="mr-2">{topic.icon}</span>}
                          {topic.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input
                    id="keywords"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    placeholder="e.g., programming, language, syntax (comma separated)"
                  />
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Keywords help match user questions to relevant FAQs. Enter comma-separated terms that users might search for.
              </p>
              
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="search">Search FAQs</Label>
              <div className="flex gap-2">
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by question, answer, or keywords..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button variant="outline" onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="topic-filter">Filter by Topic</Label>
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All topics" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All topics</SelectItem>
                  {topics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id}>
                      {topic.icon && <span className="mr-2">{topic.icon}</span>}
                      {topic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="outline" onClick={clearFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && filteredFAQs.length === 0 ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading FAQs...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFAQs.map((faq) => (
            <Card key={faq.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{faq.question}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {faq.topic.icon && <span>{faq.topic.icon}</span>}
                      <span>{faq.topic.name}</span>
                      <span>•</span>
                      <span>{new Date(faq.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(faq)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(faq.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="text-muted-foreground">
                      {truncateText(faq.answer, 200)}
                    </p>
                  </div>
                  
                  {faq.keywords && (
                    <div className="flex flex-wrap gap-1">
                      {JSON.parse(faq.keywords).map((keyword: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredFAQs.length === 0 && (
        <div className="text-center py-8">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No FAQs found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || selectedTopic 
              ? 'Try adjusting your search or filters'
              : 'Create your first FAQ to help answer common questions'
            }
          </p>
          {!searchTerm && !selectedTopic && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add FAQ
            </Button>
          )}
        </div>
      )}
    </div>
  );
}