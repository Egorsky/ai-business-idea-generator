import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import {
    Show,
    PricingTable,
    UserButton,
    SignInButton,
    useAuth
} from '@clerk/nextjs';

import {
    ThumbsUp,
    ThumbsDown,
    RefreshCw,
    LoaderCircle
} from 'lucide-react';

import { fetchEventSource } from '@microsoft/fetch-event-source';

type Rating = 'positive' | 'negative' | null;

function IdeaGenerator() {
    const { getToken } = useAuth();

    const [idea, setIdea] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [rating, setRating] = useState<Rating>(null);
    const [generation, setGeneration] = useState(0);
    const [feedbackNote, setFeedbackNote] = useState('');

    const ideaId = useRef('');

    useEffect(() => {
        const controller = new AbortController();

        let buffer = '';
        let completed = false;

        setIdea('');
        setLoading(true);
        setRating(null);
        setError('');
        setFeedbackNote('');

        ideaId.current = crypto.randomUUID();

        async function generate() {
            try {
                const jwt = await getToken();

                if (!jwt) {
                    throw new Error('Authentication required');
                }

                if (controller.signal.aborted) return;

                await fetchEventSource('/api', {
                    signal: controller.signal,
                    openWhenHidden: true,

                    headers: {
                        Authorization: `Bearer ${jwt}`
                    },

                    async onopen(response) {
                        if (!response.ok) {
                            throw new Error(
                                `Request failed: ${response.status}`
                            );
                        }

                        if (!response.headers
                            .get('content-type')
                            ?.includes('text/event-stream')) {
                            throw new Error('Invalid streaming response');
                        }
                    },

                    onmessage(event) {
                        if (event.event === 'done') {
                            completed = true;
                            return;
                        }

                        buffer += JSON.parse(event.data);
                        setIdea(buffer);
                    },

                    onclose() {
                        if (!completed) {
                            throw new Error('Generation was interrupted');
                        }
                    },

                    onerror(err) {
                        // Prevent uncontrolled automatic retries
                        throw err;
                    }
                });

            } catch (err) {
                if (!controller.signal.aborted) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : 'Unable to generate an idea'
                    );
                }

            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        generate();

        return () => controller.abort();

    }, [generation, getToken]);

    function generateAgain() {
        setLoading(true);
        setGeneration(previous => previous + 1);
    }

    function rateIdea(value: 'positive' | 'negative') {
        const nextRating = rating === value ? null : value;
        const key = `ideagen:feedback:${ideaId.current}`;

        setRating(nextRating);

        try {
            if (nextRating === null) {
                localStorage.removeItem(key);
                setFeedbackNote('');
            } else {
                localStorage.setItem(
                    key,
                    JSON.stringify({
                        id: ideaId.current,
                        idea: idea,
                        rating: nextRating,
                        timestamp: new Date().toISOString()
                    })
                );

                setFeedbackNote('Feedback saved');
            }
        } catch {
            setFeedbackNote('Unable to save feedback');
        }
    }

    return (
        <section className="generator">
            <header className="section-header">
                <h1>Your next big idea.</h1>
                <p>Discover new opportunities powered by AI.</p>
            </header>

            <article className="idea-card">
                <span className="eyebrow">
                    GENERATED IDEA
                </span>

                {loading && !idea && (
                    <div className="loading-state">
                        <LoaderCircle
                            size={24}
                            className="spinning"
                        />
                        Generating your business idea...
                    </div>
                )}

                {idea && (
                    <div className="idea-markdown">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {idea}
                        </ReactMarkdown>
                    </div>
                )}

                {error && (
                    <p className="error-message" role="alert">
                        {error}
                    </p>
                )}

                <div className="idea-toolbar">
                    <div className="feedback-actions">
                        <button
                            className={`icon-btn ${
                                rating === 'positive' ? 'selected' : ''
                            }`}
                            onClick={() => rateIdea('positive')}
                            disabled={loading || !idea || !!error}
                            aria-label="Good idea"
                            aria-pressed={rating === 'positive'}
                            title="Good idea"
                        >
                            <ThumbsUp size={18} />
                        </button>

                        <button
                            className={`icon-btn ${
                                rating === 'negative' ? 'selected' : ''
                            }`}
                            onClick={() => rateIdea('negative')}
                            disabled={loading || !idea || !!error}
                            aria-label="Bad idea"
                            aria-pressed={rating === 'negative'}
                            title="Bad idea"
                        >
                            <ThumbsDown size={18} />
                        </button>

                        <span className="feedback-label" aria-live="polite">
                            {feedbackNote}
                        </span>
                    </div>

                    <button
                        className="btn-primary"
                        onClick={generateAgain}
                        disabled={loading}
                    >
                        <RefreshCw
                            size={16}
                            className={loading ? 'spinning' : ''}
                        />

                        {loading ? 'Generating...' : 'Generate again'}
                    </button>
                </div>
            </article>

            <p className="disclaimer">
                AI-generated ideas may require market validation.
            </p>
        </section>
    );
}

export default function Product() {
    return (
        <main className="app-shell">
            <nav className="app-nav">
                <Link href="/" className="app-name">
                    Idea Generator
                </Link>

                <Show when="signed-in">
                    <UserButton />
                </Show>
            </nav>

            <Show when="signed-out">
                <section className="hero">
                    <h1>Welcome back.</h1>

                    <SignInButton mode="modal">
                        <button className="btn-primary">
                            Sign in
                        </button>
                    </SignInButton>
                </section>
            </Show>

            <Show when="signed-in">
                <Show
                    when={{ plan: 'subscription_plan' }}
                    fallback={
                        <section className="pricing-section">
                            <header className="section-header">
                                <h1>Choose your plan.</h1>
                                <p>Unlock AI-powered business ideas.</p>
                            </header>

                            <PricingTable />
                        </section>
                    }
                >
                    <IdeaGenerator />
                </Show>
            </Show>
        </main>
    );
}