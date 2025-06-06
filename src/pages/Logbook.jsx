import useFetchPage from '../hooks/useFetchPage';
import LoadingSpinner from '../components/LoadingSpinner';

function Logbook() {
    const { content, loading } = useFetchPage('logbook');

    if (loading) return <LoadingSpinner />;

    return (
        <div className="page-content" dangerouslySetInnerHTML={{ __html: content }} />
    );
}

export default Logbook;
