# AI Study Notes Frontend

Modern client-side application for managing study materials with cursor pagination.

## Features

- 🎨 **Modern Design** - Minimalist interface using Tailwind CSS
- 📱 **Responsive** - Optimized for all devices
- ⚡ **Cursor Pagination** - Efficient loading of large lists
- 🔄 **Auto Loading** - Content loading on scroll
- ➕ **Task Creation** - Modal window for adding new tasks
- 🗑️ **Task Deletion** - Safe deletion with confirmation
- 📖 **Detailed View** - Separate page with Markdown content
- 🧭 **Routing** - Navigation between list and task details
- 🎯 **Statistics** - Learning progress display
- 🛡️ **Security** - API keys in environment variables

## Technologies

- **React 18** - Main framework
- **Vite** - Fast bundler and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **React Router** - Routing between pages
- **React Markdown** - Markdown content rendering

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-studynotes-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp env.example .env
```

Edit the `.env` file:
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_KEY=your-api-key-here
```

4. Start the dev server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/          # React components
│   ├── StudyItemCard.jsx       # Study material card
│   ├── StudyItemsList.jsx      # Materials list with pagination
│   ├── TaskDetailView.jsx      # Task detail view
│   ├── CreateTaskModal.jsx     # Creation modal window
│   ├── DeleteConfirmModal.jsx  # Deletion confirmation modal
│   └── LoadingSpinner.jsx      # Loading indicator
├── pages/              # Application pages
│   ├── TaskListPage.jsx        # Task list page
│   └── TaskDetailPage.jsx      # Task detail page
├── hooks/              # Custom React hooks
│   ├── useStudyItems.js        # Hook for working with list API
│   └── useTaskDetail.js        # Hook for working with task details
├── services/           # API services
│   └── api.js              # HTTP client and API methods
├── App.jsx             # Main component with routing
├── main.jsx            # Entry point
└── index.css           # Global styles
```

## API

The application works with an API that returns data in the following format:

```json
{
  "items": [
    {
      "id": "uuid",
      "topic": "Topic Name",
      "status": "DONE|PROCESSING|QUEUED",
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ],
  "cursor": "base64-encoded-cursor"
}
```

### Task Creation

To create a new task, a POST request is sent:

```json
{
  "topic": "Node.js Express"
}
```

### Task Detail View

The API returns complete task information including Markdown content:

```json
{
  "id": "uuid",
  "topic": "Laravel",
  "status": "DONE",
  "createdAt": "ISO date",
  "updatedAt": "ISO date",
  "researchMd": "# Study Notes on Laravel\n\n## 1. Introduction to Laravel\n..."
}
```

### Endpoints

- `GET /tasks?cursor=&limit=` - Get list of materials
- `GET /tasks/:id` - Get specific material
- `POST /tasks` - Create new task
- `DELETE /tasks/:id` - Delete task

### Headers

All requests must include the header:
```
x-api-key: your-api-key
```

## Scripts

- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview build
- `npm run lint` - ESLint code check

## Configuration

### Tailwind CSS

Custom colors and styles are configured in `tailwind.config.js`:
- Primary colors for branding
- Custom components in `index.css`

### Environment Variables

- `VITE_API_BASE_URL` - Base API URL
- `VITE_API_KEY` - API key for authentication

## Development

### Adding New Components

1. Create a file in `src/components/`
2. Export the component as default
3. Import and use in `App.jsx`

### Working with API

1. Add new methods in `src/services/api.js`
2. Create a hook in `src/hooks/` for state management
3. Use the hook in components

## License

MIT License
