import React, { useState } from 'react';
import type { Feedback, FeedbackComment, User } from '../types';

interface FeedbackViewProps {
    feedbacks: Feedback[];
    currentUser: User;
    onCreateFeedback: (title: string, description: string, category: string) => void;
    onUpvoteFeedback: (feedbackId: string) => void;
    onAddComment: (feedbackId: string, content: string) => void;
}

const CATEGORIES = [
    { value: 'bug', label: '🐛 Bug', color: 'bg-red-500' },
    { value: 'feature', label: '✨ Nouvelle fonctionnalité', color: 'bg-blue-500' },
    { value: 'improvement', label: '🚀 Amélioration', color: 'bg-green-500' },
    { value: 'other', label: '💡 Autre', color: 'bg-purple-500' },
];

const STATUS_LABELS = {
    'pending': { label: '⏳ En attente', color: 'bg-gray-500' },
    'in-progress': { label: '🔨 En cours', color: 'bg-yellow-500' },
    'completed': { label: '✅ Complété', color: 'bg-green-500' },
    'rejected': { label: '❌ Rejeté', color: 'bg-red-500' },
};

const FeedbackView: React.FC<FeedbackViewProps> = ({
    feedbacks,
    currentUser,
    onCreateFeedback,
    onUpvoteFeedback,
    onAddComment,
}) => {
    const [isCreating, setIsCreating] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('feature');
    const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
    const [commentContent, setCommentContent] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');

    const handleCreateFeedback = () => {
        if (title.trim() && description.trim()) {
            onCreateFeedback(title.trim(), description.trim(), category);
            setTitle('');
            setDescription('');
            setCategory('feature');
            setIsCreating(false);
        } else {
            alert('Veuillez remplir tous les champs.');
        }
    };

    const handleAddComment = (feedbackId: string) => {
        if (commentContent.trim()) {
            onAddComment(feedbackId, commentContent.trim());
            setCommentContent('');
        }
    };

    const timeSince = (date: number) => {
        const seconds = Math.floor((Date.now() - date) / 1000);
        let interval = seconds / 86400;
        if (interval > 1) return `il y a ${Math.floor(interval)} jour(s)`;
        interval = seconds / 3600;
        if (interval > 1) return `il y a ${Math.floor(interval)} heure(s)`;
        interval = seconds / 60;
        if (interval > 1) return `il y a ${Math.floor(interval)} minute(s)`;
        return `à l'instant`;
    };

    // Filtrer et trier les feedbacks
    const filteredFeedbacks = feedbacks
        .filter(f => filterCategory === 'all' || f.category === filterCategory)
        .sort((a, b) => {
            if (sortBy === 'popular') {
                return b.upvotes.length - a.upvotes.length;
            }
            return b.createdAt - a.createdAt;
        });

    return (
        <div className="space-y-6">
            {/* Header avec bouton de création */}
            <div className="bg-brand-light p-6 rounded-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div>
                        <h2 className="text-3xl font-bold">💬 Feedback</h2>
                        <p className="text-sm text-brand-subtle mt-1">Partagez vos idées et suggestions pour améliorer l'app</p>
                    </div>
                    {!isCreating && (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="px-4 py-2 font-semibold text-white bg-brand-emlyon rounded-md hover:opacity-90 transition-opacity"
                        >
                            + Nouveau feedback
                        </button>
                    )}
                </div>

                {/* Formulaire de création */}
                {isCreating && (
                    <div className="space-y-4 p-4 bg-brand-secondary rounded-lg">
                        <div>
                            <label className="block text-sm font-medium mb-2">Catégorie</label>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.value}
                                        onClick={() => setCategory(cat.value)}
                                        className={`px-3 py-1 rounded-full text-sm font-medium transition ${category === cat.value
                                                ? `${cat.color} text-white`
                                                : 'bg-brand-bg text-brand-subtle hover:text-brand-dark'
                                            }`}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Titre</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ex: Ajouter un mode sombre"
                                className="w-full px-4 py-2 text-brand-dark bg-brand-bg border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-brand-emlyon"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Décrivez votre suggestion en détail..."
                                rows={4}
                                className="w-full px-4 py-2 text-brand-dark bg-brand-bg border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-brand-emlyon resize-none"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleCreateFeedback}
                                className="px-4 py-2 font-semibold text-white bg-brand-emlyon rounded-md hover:opacity-90 transition-opacity"
                            >
                                Publier
                            </button>
                            <button
                                onClick={() => {
                                    setIsCreating(false);
                                    setTitle('');
                                    setDescription('');
                                    setCategory('feature');
                                }}
                                className="px-4 py-2 font-semibold text-brand-subtle hover:text-brand-dark transition"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Filtres et tri */}
            <div className="bg-brand-light p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">Filtrer:</span>
                    <button
                        onClick={() => setFilterCategory('all')}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition ${filterCategory === 'all'
                                ? 'bg-brand-emlyon text-white'
                                : 'bg-brand-bg text-brand-subtle hover:text-brand-dark'
                            }`}
                    >
                        Tous
                    </button>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.value}
                            onClick={() => setFilterCategory(cat.value)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition ${filterCategory === cat.value
                                    ? `${cat.color} text-white`
                                    : 'bg-brand-bg text-brand-subtle hover:text-brand-dark'
                                }`}
                        >
                            {cat.label.split(' ')[0]}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Trier:</span>
                    <button
                        onClick={() => setSortBy('recent')}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition ${sortBy === 'recent'
                                ? 'bg-brand-emlyon text-white'
                                : 'bg-brand-bg text-brand-subtle hover:text-brand-dark'
                            }`}
                    >
                        Récents
                    </button>
                    <button
                        onClick={() => setSortBy('popular')}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition ${sortBy === 'popular'
                                ? 'bg-brand-emlyon text-white'
                                : 'bg-brand-bg text-brand-subtle hover:text-brand-dark'
                            }`}
                    >
                        Populaires
                    </button>
                </div>
            </div>

            {/* Liste des feedbacks */}
            <div className="space-y-4">
                {filteredFeedbacks.length > 0 ? (
                    filteredFeedbacks.map(feedback => {
                        const categoryInfo = CATEGORIES.find(c => c.value === feedback.category);
                        const statusInfo = STATUS_LABELS[feedback.status];
                        const hasUpvoted = feedback.upvotes.includes(currentUser.id);
                        const isExpanded = selectedFeedback?.id === feedback.id;

                        return (
                            <div key={feedback.id} className="bg-brand-light rounded-lg overflow-hidden hover:bg-brand-secondary/20 transition">
                                <div className="p-4">
                                    <div className="flex items-start gap-4">
                                        {/* Upvote button */}
                                        <button
                                            onClick={() => onUpvoteFeedback(feedback.id)}
                                            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-md transition ${hasUpvoted
                                                    ? 'bg-brand-emlyon text-white'
                                                    : 'bg-brand-bg text-brand-subtle hover:text-brand-dark hover:bg-brand-secondary'
                                                }`}
                                        >
                                            <span className="text-xl">▲</span>
                                            <span className="text-sm font-bold">{feedback.upvotes.length}</span>
                                        </button>

                                        {/* Feedback content */}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${categoryInfo?.color}`}>
                                                            {categoryInfo?.label}
                                                        </span>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${statusInfo.color}`}>
                                                            {statusInfo.label}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-brand-dark">{feedback.title}</h3>
                                                </div>
                                            </div>
                                            <p className="text-brand-subtle mb-3">{feedback.description}</p>
                                            <div className="flex items-center gap-4 text-sm text-brand-subtle">
                                                <div className="flex items-center gap-2">
                                                    <img src={feedback.creator.avatarUrl} alt={feedback.creator.name} className="w-6 h-6 rounded-full" />
                                                    <span>{feedback.creator.name}</span>
                                                </div>
                                                <span>{timeSince(feedback.createdAt)}</span>
                                                <button
                                                    onClick={() => setSelectedFeedback(isExpanded ? null : feedback)}
                                                    className="text-brand-emlyon hover:underline font-medium"
                                                >
                                                    💬 {feedback.comments.length} commentaire{feedback.comments.length !== 1 ? 's' : ''}
                                                </button>
                                            </div>

                                            {/* Comments section */}
                                            {isExpanded && (
                                                <div className="mt-4 pt-4 border-t border-brand-secondary space-y-3">
                                                    {feedback.comments.map(comment => (
                                                        <div key={comment.id} className="flex gap-3">
                                                            <img src={comment.user.avatarUrl} alt={comment.user.name} className="w-8 h-8 rounded-full flex-shrink-0" />
                                                            <div className="flex-1 bg-brand-bg p-3 rounded-lg">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="font-semibold text-sm">{comment.user.name}</span>
                                                                    <span className="text-xs text-brand-subtle">{timeSince(comment.createdAt)}</span>
                                                                </div>
                                                                <p className="text-sm text-brand-dark">{comment.content}</p>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {/* Add comment form */}
                                                    <div className="flex gap-3 mt-4">
                                                        <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-8 h-8 rounded-full flex-shrink-0" />
                                                        <div className="flex-1">
                                                            <textarea
                                                                value={commentContent}
                                                                onChange={(e) => setCommentContent(e.target.value)}
                                                                placeholder="Ajouter un commentaire..."
                                                                rows={2}
                                                                className="w-full px-3 py-2 text-sm text-brand-dark bg-brand-bg border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-brand-emlyon resize-none"
                                                            />
                                                            <button
                                                                onClick={() => handleAddComment(feedback.id)}
                                                                disabled={!commentContent.trim()}
                                                                className="mt-2 px-4 py-1 text-sm font-semibold text-white bg-brand-emlyon rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                                                            >
                                                                Commenter
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="bg-brand-light p-12 rounded-lg text-center">
                        <p className="text-brand-subtle text-lg">Aucun feedback pour cette catégorie.</p>
                        <p className="text-brand-subtle text-sm mt-2">Soyez le premier à partager vos idées !</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeedbackView;
