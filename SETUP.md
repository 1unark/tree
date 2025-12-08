# Timeline Backend Setup Instructions

## Backend Setup

1. **Install dependencies** (if not already installed):
   ```bash
   cd backend
   pip install django djangorestframework django-cors-headers
   ```

2. **Create and run migrations**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

3. **Load test data** (optional):
   ```bash
   python manage.py shell
   ```
   Then copy and paste the contents of `load_test_data.py` into the shell, or:
   ```bash
   python load_test_data.py
   ```

4. **Run the development server**:
   ```bash
   python manage.py runserver
   ```
   The API will be available at `http://localhost:8000/api/`

## Frontend Setup

1. **Create environment file**:
   Create `frontend/.env.local` with:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

2. **Install dependencies** (if not already installed):
   ```bash
   cd frontend
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:3000`

## API Endpoints

- `GET /api/chapters/` - List all chapters
- `POST /api/chapters/` - Create a chapter
- `GET /api/chapters/{id}/` - Get a chapter
- `PATCH /api/chapters/{id}/` - Update a chapter
- `DELETE /api/chapters/{id}/` - Delete a chapter

- `GET /api/events/` - List all events
- `POST /api/events/` - Create an event
- `GET /api/events/{id}/` - Get an event
- `PATCH /api/events/{id}/` - Update an event
- `DELETE /api/events/{id}/` - Delete an event

## Data Structure

### Chapter Types
- `main_period`: Main timeline periods (e.g., "Childhood", "School Years")
- `branch`: Branch timelines (e.g., "Career", "Relationships")
- `branch_period`: Periods within branches

### Models
- **Chapter**: Represents periods or branches in the timeline
  - Has `start_date` and `end_date` for date ranges
  - Has `type` to distinguish between main periods, branches, and branch periods
  - Has `x_position` for branch positioning
  
- **Event**: Represents individual entries/events
  - Has a `date` (single date)
  - Belongs to a `chapter` (period)
  - Has `preview` and `content` fields for display

## Notes

- Test data has been commented out in `TimelineFlow.tsx`
- The frontend now fetches data from the backend API
- CORS is configured to allow requests from `localhost:3000`
- Authentication is currently set to `AllowAny` for development (change to `IsAuthenticated` in production)

