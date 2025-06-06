import useFetchPage from '../hooks/useFetchPage';
import LoadingSpinner from '../components/LoadingSpinner'

function Description() {
    const { content, loading } = useFetchPage('description');

    if (loading) return <LoadingSpinner />;

    return (
        <div className="page-content" dangerouslySetInnerHTML={{ __html: content }} />
    );
}

export default Description;
