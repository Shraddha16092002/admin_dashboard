import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get(`https://openlibrary.org/search.json?q=the+great+gatsby&page=${currentPage}&limit=${itemsPerPage}`);
        const booksData = response.data.docs;
        setBooks(booksData);

        const authorIds = [...new Set(booksData.map(book => book.author_key[0]))];
        const authorsResponse = await Promise.all(
          authorIds.map(id => axios.get(`https://openlibrary.org/authors/${id}.json`))
        );

        const authorsData = authorsResponse.reduce((acc, res) => {
          acc[res.data.key] = res.data;
          return acc;
        }, {});

        setAuthors(authorsData);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    fetchBooks();
  }, [currentPage, itemsPerPage]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedBooks = [...books].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setBooks(sortedBooks);
  };

  const handlePageChange = (event) => {
    setCurrentPage(Number(event.target.value));
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <div>
        <label>
          Items per page:
          <select value={itemsPerPage} onChange={handleItemsPerPageChange}>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
          </select>
        </label>
      </div>
      <table border="1">
        <thead>
          <tr>
            <th onClick={() => handleSort('ratings_average')}>Ratings Average</th>
            <th onClick={() => handleSort('author_name')}>Author Name</th>
            <th onClick={() => handleSort('title')}>Title</th>
            <th onClick={() => handleSort('first_publish_year')}>First Publish Year</th>
            <th onClick={() => handleSort('subject')}>Subject</th>
            <th onClick={() => handleSort('author_birth_date')}>Author Birth Date</th>
            <th onClick={() => handleSort('author_top_work')}>Author Top Work</th>
          </tr>
        </thead>
        <tbody>
          {books.map(book => {
            const author = authors[book.author_key[0]] || {};
            return (
              <tr key={book.key}>
                <td>{book.ratings_average || 'N/A'}</td>
                <td>{book.author_name?.[0] || 'N/A'}</td>
                <td>{book.title}</td>
                <td>{book.first_publish_year || 'N/A'}</td>
                <td>{book.subject?.join(', ') || 'N/A'}</td>
                <td>{author.birth_date || 'N/A'}</td>
                <td>{author.top_work || 'N/A'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div>
        <label>
          Page:
          <select value={currentPage} onChange={handlePageChange}>
            {/* Assuming you have total pages calculated */}
            {[...Array(10).keys()].map(i => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
};

export default Dashboard;
