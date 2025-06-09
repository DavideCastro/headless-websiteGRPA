import { useParams } from 'react-router-dom';
import useFetchPage from '../hooks/useFetchPage';
import LoadingSpinner from '../components/LoadingSpinner';

function DynamicPage() {
    const { slug } = useParams();
    const { content, loading } = useFetchPage(slug);

    if (loading) return <LoadingSpinner />;

    if (!content) {
        return (
            <main>
                <section id="articles">
                    <article>
                        <header>
                            <h2>Page not found</h2>
                            <p>Published the {new Date().toLocaleDateString('fr-FR')}</p>
                        </header>
                        <p>This page doesn't exist or couldn't be charged.</p>
                    </article>
                </section>
            </main>
        );
    }

    return (
        <main>
            <section id="articles">
                <article dangerouslySetInnerHTML={{ __html: content }} />
            </section>
        </main>
    );
}

export default DynamicPage;