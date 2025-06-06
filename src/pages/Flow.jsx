import useFetchPage from '../hooks/useFetchPage';
import LoadingSpinner from '../components/LoadingSpinner';

function Flow() {
    const { content, loading } = useFetchPage('flow');

    if (loading) return <LoadingSpinner />;

    return (
        <div className="page-content" dangerouslySetInnerHTML={{ __html: content }} />
    );
}

export default Flow;
