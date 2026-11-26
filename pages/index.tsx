import Link from 'next/link';
import {
    SignInButton,
    Show,
    UserButton
} from '@clerk/nextjs';

export default function Home() {
    return (
        <main className="app-shell">
            <nav className="app-nav">
                <span className="app-name">
                    Idea Generator
                </span>

                <Show when="signed-out">
                    <SignInButton mode="modal">
                        <button className="btn-secondary">
                            Sign in
                        </button>
                    </SignInButton>
                </Show>

                <Show when="signed-in">
                    <div className="nav-actions">
                        <Link href="/product" className="btn-secondary">
                            Open app
                        </Link>
                        <UserButton />
                    </div>
                </Show>
            </nav>

            <section className="hero">
                <span className="eyebrow">
                    AI-POWERED DISCOVERY
                </span>

                <h1>Your next big idea.</h1>

                <p>
                    Discover business opportunities,
                    explore new markets and turn ideas
                    into something meaningful.
                </p>

                <Show when="signed-out">
                    <SignInButton mode="modal">
                        <button className="btn-primary">
                            Get started
                        </button>
                    </SignInButton>
                </Show>

                <Show when="signed-in">
                    <Link href="/product" className="btn-primary">
                        Start generating
                    </Link>
                </Show>
            </section>
        </main>
    );
}