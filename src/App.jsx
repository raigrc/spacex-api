import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import "./assets/scss/styles.scss"
import axios from 'axios';
import Spinner from './components/Spinner/Spinner';
import { formatDistanceToNow } from 'date-fns';

function App() {
  const [launches, setLaunches] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [viewDetails, setViewDetails] = useState(false)
  const [query, setQuery] = useState('')
  const [hasMore, setHasMore] = useState(true)
  const containerRef = useRef(null)

  const handleScroll = () => {
    if (containerRef.current && containerRef.current.scrollTop + containerRef.current.clientHeight >= containerRef.current.scrollHeight - 50) {
      setPage((prevPage) => prevPage + 1)
    }
  }

  useEffect(() => {
    const fetchData = async (query, page) => {
      if (loading) return;
      setLoading(true)
      try {
        axios.post('https://api.spacexdata.com/v5/launches/query',
          { query: query ? { name: { $regex: query, $options: 'i' } } : {}, options: { offset: (page - 1) * 10, limit: 10 } })
          .then((response) => {
            console.log(response);

            setLaunches(page === 1 ? response.data.docs : [...launches, ...response.data.docs]);
            setHasMore(response.data.docs > 0)
          })
      } catch (error) {
        console.error("Error fetching data!", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData(query, page)
  }, [query, page])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const handleViewContent = () => {
    setViewDetails(!viewDetails)
  }

  return <div className="App main__wrapper">
    <div className='search'>
      <input type='search' value={query} onChange={(e) => {
        setQuery(e.target.value);
        setPage(1);
        console.log(e.target.value);
      }} />
    </div>
    <div className='launch__wrapper' ref={containerRef}>
      <div className='launch__list'>
        {launches.map((launch, index) => (
          <div key={`${launch.id}-${index}`} className='launch__item'>
            <div className=''>
              <h2>{launch.name}</h2>
              <p className={`launch__status ${launch.success ? "launch__status--success" : launch.upcoming ? "launch__status--warning" : "launch__status--danger"}`}>{launch.success ? "success" : launch.upcoming ? "upcoming" : "failed"}</p>
            </div>

            {viewDetails && <div className='launch__body'>
              <div className='launch__details'>
                <div className='launch__meta'>
                  <p className='launch__meta-item'>{formatDistanceToNow(new Date(launch.date_local), { addSuffix: true })}</p>
                  {launch.links.article && <a className='launch__meta-item' href={launch.links.article}>Article</a>}
                  <a className='launch__meta-item' href={launch.links.webcast}>Video</a>
                </div>

                <div className='media'>
                  <img src={launch.links.patch.small} alt={launch.links.patch.large} />
                  {launch.details}
                </div>
              </div>
            </div>}

            <button className='btn btn--primary' onClick={handleViewContent}>{viewDetails ? "Hide" : "View"}</button>
          </div>
        ))}
        {loading && <Spinner />}
        {!loading && !hasMore && <p className="end-of-results">End of Results</p>}
      </div>
    </div>
  </div>;
}

export default App;
