import useFetchPage from '../hooks/useFetchPage';
import LoadingSpinner from '../components/LoadingSpinner';

function Model() {
    const { content, loading } = useFetchPage('model');

    if (loading) return <LoadingSpinner />;

    return (
        <div className="page-content" dangerouslySetInnerHTML={{ __html: content }} />
    );
}

export default Model;
