import React, { useState, useEffect } from 'react';

const News = () => {
    const [newsData, setNewsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await fetch('http://localhost:5000/news');
                const data = await response.json();
                setNewsData(data);
            } catch (error) {
                console.error('Error fetching news:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNews();
    }, []);

    return (
        <div className="ipl-form-container" style={{ marginTop: '12px' }}>
            <h2 className='welcome-title' style={{ textDecoration: 'underline' }}>Latest Cricket News</h2>
            {isLoading ? (
                <div className='loading-dots'>
                    Loading Latest Cricket News
                    <span>.</span><span>.</span><span>.</span>
                </div>
            ) : (
                newsData.map((newsItem) => (
                    <div key={newsItem.headline} className="news-item">
                        <a href={`https://www.espncricinfo.com${newsItem.link}`} target="_blank" rel="noopener noreferrer">
                            <h3>{newsItem.headline}</h3>
                        </a>
                        <p>{newsItem.summary}</p>
                        <span>{newsItem.time}</span>
                    </div>
                ))
            )}
        </div>
    );
};

export default News;
