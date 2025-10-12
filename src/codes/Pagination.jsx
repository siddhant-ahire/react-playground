// DynamicListComponent.jsx
// Usage: import DynamicList from './DynamicListComponent' and render <DynamicList />
// Tailwind CSS classes are used for styling — ensure Tailwind is configured in your project.

const sampleData = Array.from({ length: 57 }, (_, i) => {
  const categories = ['Books', 'Electronics', 'Clothing', 'Kitchen'];
  return {
    id: i + 1,
    name: `Item ${i + 1}`,
    description: `This is description for item ${i + 1}`,
    category: categories[i % categories.length],
    price: Number((Math.random() * 200 + 10).toFixed(2)),
    createdAt: new Date(Date.now() - i * 86400000), // each item a day older
  };
});

function DynamicList({ data = sampleData }) {
  // Filters / UI state
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [sortField, setSortField] = React.useState('name');
  const [sortOrder, setSortOrder] = React.useState('asc');
  const [pageSize, setPageSize] = React.useState(10);
  const [page, setPage] = React.useState(1);
  const [view, setView] = React.useState('table'); // 'table' or 'cards'

  // debounce search to avoid recomputing on every keystroke
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => clearTimeout(t);
  }, [search]);

  // all unique categories (including "All")
  const categories = React.useMemo(() => {
    const set = new Set(data.map((d) => d.category));
    return ['All', ...Array.from(set)];
  }, [data]);

  // filtered + sorted data
  const processed = React.useMemo(() => {
    let items = data;

    // filtering: category
    if (selectedCategory !== 'All') {
      items = items.filter((it) => it.category === selectedCategory);
    }

    // filtering: search across name & description (case-insensitive)
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      items = items.filter(
        (it) => it.name.toLowerCase().includes(q) || it.description.toLowerCase().includes(q),
      );
    }

    // sorting
    items = items.slice(); // copy
    items.sort((a, b) => {
      let av = a[sortField];
      let bv = b[sortField];

      // support createdAt (Date) and numeric
      if (av instanceof Date) av = av.getTime();
      if (bv instanceof Date) bv = bv.getTime();

      if (typeof av === 'string') {
        av = av.toLowerCase();
        bv = bv.toLowerCase();
      }

      if (av < bv) return sortOrder === 'asc' ? -1 : 1;
      if (av > bv) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return items;
  }, [data, selectedCategory, debouncedSearch, sortField, sortOrder]);

  // pagination calculations
  const total = processed.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // ensure page is in bounds when dependencies change
  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const pageItems = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return processed.slice(start, start + pageSize);
  }, [processed, page, pageSize]);

  // helper: change sort field or toggle order if same
  function changeSort(field) {
    if (field === sortField) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex gap-2 items-center">
          <input
            aria-label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or description..."
            className="px-3 py-2 border rounded-md shadow-sm w-64"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2 py-2 border rounded-md"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            className="px-2 py-2 border rounded-md"
          >
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="createdAt">Date</option>
            <option value="category">Category</option>
          </select>

          <button
            onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
            className="px-3 py-2 border rounded-md"
            title="Toggle sort order"
          >
            {sortOrder === 'asc' ? 'Asc' : 'Desc'}
          </button>

          <div className="ml-2">View:</div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setView('table')}
              className={`px-2 py-1 border rounded ${view === 'table' ? 'bg-gray-100' : ''}`}
            >
              Table
            </button>
            <button
              onClick={() => setView('cards')}
              className={`px-2 py-1 border rounded ${view === 'cards' ? 'bg-gray-100' : ''}`}
            >
              Cards
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div>
            <label className="mr-2">Page size</label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-2 border rounded-md"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            {total} result{total !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Results */}
      {view === 'table' ? (
        <div className="overflow-x-auto border rounded">
          <table className="w-full table-auto">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3 cursor-pointer" onClick={() => changeSort('name')}>
                  Name
                </th>
                <th className="p-3">Description</th>
                <th className="p-3 cursor-pointer" onClick={() => changeSort('category')}>
                  Category
                </th>
                <th className="p-3 cursor-pointer" onClick={() => changeSort('price')}>
                  Price
                </th>
                <th className="p-3 cursor-pointer" onClick={() => changeSort('createdAt')}>
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((it) => (
                <tr key={it.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{it.name}</td>
                  <td className="p-3 text-sm text-gray-600">{it.description}</td>
                  <td className="p-3">{it.category}</td>
                  <td className="p-3">₹{it.price.toFixed(2)}</td>
                  <td className="p-3 text-sm">{it.createdAt.toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pageItems.map((it) => (
            <div key={it.id} className="border rounded p-3 shadow-sm">
              <div className="font-semibold">{it.name}</div>
              <div className="text-xs text-gray-600 mb-2">
                {it.category} • {it.createdAt.toLocaleDateString()}
              </div>
              <div className="text-sm mb-2">{it.description}</div>
              <div className="font-medium">Price: ₹{it.price.toFixed(2)}</div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-3 py-1 border rounded ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Prev
          </button>

          {/* show up to 7 page buttons with current in middle */}
          <div className="flex gap-1">{renderPageButtons(page, totalPages, setPage)}</div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={`px-3 py-1 border rounded ${page === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Next
          </button>
        </div>

        <div className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </div>
      </div>
    </div>
  );
}

// Small helper to render a compact range of page buttons (keeps UI tidy)
function renderPageButtons(current, total, setPage) {
  const buttons = [];
  const maxButtons = 7;
  let start = Math.max(1, current - Math.floor(maxButtons / 2));
  let end = start + maxButtons - 1;
  if (end > total) {
    end = total;
    start = Math.max(1, end - maxButtons + 1);
  }

  if (start > 1) {
    buttons.push(
      <button key={'p-1'} onClick={() => setPage(1)} className="px-2 py-1 border rounded">
        1
      </button>,
    );
    if (start > 2)
      buttons.push(
        <span key={'dots-start'} className="px-2">
          …
        </span>,
      );
  }

  for (let i = start; i <= end; i++) {
    buttons.push(
      <button
        key={i}
        onClick={() => setPage(i)}
        className={`px-2 py-1 border rounded ${i === current ? 'bg-gray-200 font-semibold' : ''}`}
      >
        {i}
      </button>,
    );
  }

  if (end < total) {
    if (end < total - 1)
      buttons.push(
        <span key={'dots-end'} className="px-2">
          …
        </span>,
      );
    buttons.push(
      <button key={'plast'} onClick={() => setPage(total)} className="px-2 py-1 border rounded">
        {total}
      </button>,
    );
  }

  return buttons;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<DynamicList />);
