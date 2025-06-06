import useFetchPage from '../hooks/useFetchPage';
import LoadingSpinner from '../components/LoadingSpinner';

function Mockup() {
    const { content, loading } = useFetchPage('mockup');

    if (loading) return <LoadingSpinner />;

    return (
        <div className="page-content" dangerouslySetInnerHTML={{ __html: content }} />
    );
}

export default Mockup;
