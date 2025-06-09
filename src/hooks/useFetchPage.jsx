import { useState, useEffect } from 'react';

function useFetchPage(slug) {
    const [content, setContent] = useState(null);
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`https://webdevgroupa-b5fgc8ffdedra7bw.switzerlandnorth-01.azurewebsites.net/wp-json/wp/v2/pages?slug=${slug}`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    setContent(data[0].content.rendered);
                    setTitle(data[0].title.rendered);
                }
                setLoading(false);
            });
    }, [slug]);

    return { content, title, loading };
}

export default useFetchPage;
