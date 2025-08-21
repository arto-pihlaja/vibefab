# VibeFab Architecture

## Tech Stack

### Frontend
- **Framework**: React.js with TypeScript
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React Context API or Zustand
- **UI Components**: Headless UI or Radix UI for accessible components
- **Image Handling**: React Webcam for camera capture, File API for uploads
- **Build Tool**: Vite for fast development and optimized builds

### Backend
- **Language**: Python 3.11+
- **Framework**: FastAPI for high-performance async API
- **Image Processing**: Pillow (PIL) for image manipulation
- **AI Integration**: OpenAI GPT-4 Vision API or Anthropic Claude 3 Vision
- **Database**: None required (stateless application)
- **File Storage**: Local temporary storage only

### Infrastructure
- **Hosting**: Vercel (frontend) + Railway/Render (backend)
- **Environment**: Docker for containerization (optional)
- **CI/CD**: GitHub Actions for automated testing and deployment

## System Architecture

### High-Level Design
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │  FastAPI Backend│    │  LLM API (OpenAI│
│                 │◄──►│                 │◄──►│  / Claude)      │
│ - Photo Capture │    │ - Image Processing│   │ - Style Analysis│
│ - UI/UX        │    │ - API Endpoints │    │ - Recommendations│
│ - State Mgmt   │    │ - No Auth       │    └─────────────────┘
└─────────────────┘    └─────────────────┘
```

### Data Flow
1. **User Input**: Photo capture/upload + occasion selection
2. **Frontend Processing**: Image validation and optimization
3. **Backend Processing**: Image preprocessing and LLM prompt preparation
4. **AI Analysis**: Send image + context to multimodal LLM
5. **Response Processing**: Parse LLM response and format recommendations
6. **User Display**: Present styled recommendations with explanations

## Folder Structure

```
vibefab/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── PhotoCapture/    # Camera and file upload
│   │   │   ├── OccasionSelector/ # Event type selection
│   │   │   ├── StyleResults/     # Recommendation display
│   │   │   └── common/          # Shared components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API calls and external services
│   │   ├── types/          # TypeScript type definitions
│   │   ├── utils/          # Helper functions
│   │   └── App.tsx         # Main application component
│   ├── public/             # Static assets
│   ├── package.json        # Frontend dependencies
│   └── vite.config.ts      # Vite configuration
│
├── backend/                 # FastAPI backend application
│   ├── app/
│   │   ├── api/            # API route handlers
│   │   │   ├── style.py    # Style consultation endpoints
│   │   │   └── upload.py   # File upload handling
│   │   ├── core/           # Core application logic
│   │   │   ├── config.py   # Configuration management
│   │   │   └── database.py # Database connection (if needed later)
│   │   ├── services/       # Business logic
│   │   │   ├── llm_service.py    # LLM integration
│   │   │   ├── image_service.py  # Image processing
│   │   │   └── style_service.py  # Style analysis logic
│   │   └── utils/          # Helper functions
│   ├── requirements.txt    # Python dependencies
│   ├── main.py            # FastAPI application entry point
│   └── Dockerfile         # Container configuration (optional)
│
├── docs/                   # Project documentation
│   ├── description.md     # Application overview
│   ├── architecture.md    # This file
│   └── todo.md           # Development tasks
│
├── tests/                 # Test suite
│   ├── frontend/         # Frontend tests
│   ├── backend/          # Backend tests
│   └── e2e/             # End-to-end tests
│
├── .github/              # GitHub configuration
│   └── workflows/        # CI/CD workflows
│
├── docker-compose.yml    # Local development setup (optional)
├── README.md            # Project overview
└── .env.example         # Environment variables template
```

## Key Components

### Frontend Components
- **PhotoCapture**: Handles camera access and file uploads
- **OccasionSelector**: Dropdown/radio selection for event types
- **StyleResults**: Displays AI-generated recommendations
- **LoadingStates**: Progress indicators during AI processing
- **ErrorHandling**: User-friendly error messages

### Backend Services
- **LLMService**: Manages communication with AI models
- **ImageService**: Handles image processing and optimization
- **StyleService**: Orchestrates the style consultation workflow

### API Endpoints
- `POST /api/upload/photo` - Photo upload endpoint
- `POST /api/style/consult` - Style consultation request

## Simplified Considerations

### Data Handling
- **Image Privacy**: Images processed in memory, no permanent storage
- **No User Data**: No user accounts, profiles, or consultation history
- **Stateless**: Each request is independent, no session management

### Security (Minimal)
- **Input Validation**: Basic validation to prevent API abuse
- **Rate Limiting**: Simple rate limiting to prevent excessive API calls
- **CORS**: Basic CORS configuration for frontend-backend communication

### Performance Optimizations
- **Image Compression**: Optimize images before LLM processing
- **Async Processing**: Non-blocking API responses
- **CDN**: Fast image delivery and static asset serving

## Development Phases

### Phase 1: Core Functionality (Priority: High)
- [ ] Basic photo upload and LLM integration
- [ ] Simple UI for photo capture and occasion selection
- [ ] Basic style recommendations display

### Phase 2: Enhanced Features (Priority: Medium)
- [ ] Improved UI/UX components
- [ ] Better error handling and validation
- [ ] Image optimization and processing

### Phase 3: Polish & Deployment (Priority: Low)
- [ ] Performance optimization
- [ ] Production deployment
- [ ] Basic monitoring and logging

## Environment Variables
```
# Backend (.env)
OPENAI_API_KEY=your_openai_api_key
# or
ANTHROPIC_API_KEY=your_anthropic_api_key

# Optional
MAX_FILE_SIZE=10485760  # 10MB
RATE_LIMIT_PER_MINUTE=10
```